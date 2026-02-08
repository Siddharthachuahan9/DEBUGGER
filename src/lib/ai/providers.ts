import { AIProvider } from "@/types";

type ProviderConfig = {
  apiKey: string;
  model: string;
};

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ProviderResponse = {
  content: string;
  tokensUsed: { input: number; output: number; total: number };
};

class ProviderError extends Error {
  status: number;
  provider: string;
  retryable: boolean;
  retryAfterMs: number | null;

  constructor(
    provider: string,
    status: number,
    rawBody: string
  ) {
    const message = parseErrorMessage(provider, status, rawBody);
    super(message);
    this.name = "ProviderError";
    this.status = status;
    this.provider = provider;
    this.retryable = status === 429 || status === 503 || status >= 500;
    this.retryAfterMs = extractRetryDelay(status, rawBody);
  }
}

function parseErrorMessage(provider: string, status: number, rawBody: string): string {
  // Rate limit
  if (status === 429) {
    const retryMatch = rawBody.match(/retry\s*(?:in|after)\s*([\d.]+)\s*s/i);
    const retryHint = retryMatch
      ? ` Try again in ${Math.ceil(parseFloat(retryMatch[1]))} seconds.`
      : " Wait a moment and try again.";

    if (/free.tier/i.test(rawBody) || /FreeTier/i.test(rawBody)) {
      return `${provider} free tier quota exceeded.${retryHint} Upgrade your ${provider} plan or switch to a different provider.`;
    }
    return `${provider} rate limit reached.${retryHint}`;
  }

  // Auth errors
  if (status === 401 || status === 403) {
    return `${provider} API key is invalid or expired. Check your key in Settings.`;
  }

  // Not found (bad model)
  if (status === 404) {
    return `${provider} model not found. The selected model may be unavailable or the model ID is incorrect.`;
  }

  // Payment required
  if (status === 402) {
    return `${provider} account has insufficient credits. Add billing to your ${provider} account.`;
  }

  // Input too large
  if (status === 413 || /too.large|token.limit|max.*length/i.test(rawBody)) {
    return `Input too large for the selected ${provider} model. Try a shorter input or a model with a larger context window.`;
  }

  // Server errors
  if (status >= 500) {
    return `${provider} is experiencing issues (${status}). Try again or switch to a different provider.`;
  }

  // Try to extract a message field from JSON
  try {
    const parsed = JSON.parse(rawBody);
    const msg =
      parsed?.error?.message ??
      parsed?.message ??
      parsed?.error ??
      null;
    if (typeof msg === "string" && msg.length < 300) {
      return `${provider} error: ${msg}`;
    }
  } catch {
    // Not JSON
  }

  return `${provider} returned an error (${status}). Try again or switch providers.`;
}

function extractRetryDelay(status: number, rawBody: string): number | null {
  if (status !== 429) return null;

  // Check for "retry in Xs" pattern
  const retryMatch = rawBody.match(/retry\s*(?:in|after)\s*([\d.]+)\s*s/i);
  if (retryMatch) {
    return Math.ceil(parseFloat(retryMatch[1])) * 1000;
  }

  // Check for retryDelay JSON field
  try {
    const parsed = JSON.parse(rawBody);
    const delayStr =
      parsed?.error?.details?.find?.(
        (d: Record<string, string>) => d["@type"]?.includes("RetryInfo")
      )?.retryDelay;
    if (delayStr) {
      const seconds = parseFloat(delayStr);
      if (!isNaN(seconds)) return seconds * 1000;
    }
  } catch {
    // Ignore parse failures
  }

  return 30000; // Default 30s for 429s without explicit delay
}

async function callOpenAI(
  config: ProviderConfig,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ProviderError("OpenAI", response.status, body);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: {
      input: data.usage?.prompt_tokens ?? 0,
      output: data.usage?.completion_tokens ?? 0,
      total: data.usage?.total_tokens ?? 0,
    },
  };
}

async function callAnthropic(
  config: ProviderConfig,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const systemMessage = messages.find((m) => m.role === "system");
  const userMessages = messages.filter((m) => m.role !== "system");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system: systemMessage?.content ?? "",
      messages: userMessages.map((m) => ({
        role: m.role === "system" ? "user" : m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ProviderError("Anthropic", response.status, body);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    tokensUsed: {
      input: data.usage?.input_tokens ?? 0,
      output: data.usage?.output_tokens ?? 0,
      total: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    },
  };
}

async function callGemini(
  config: ProviderConfig,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const systemMessage = messages.find((m) => m.role === "system");
  const userMessages = messages.filter((m) => m.role !== "system");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: systemMessage
          ? { parts: [{ text: systemMessage.content }] }
          : undefined,
        contents: userMessages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new ProviderError("Gemini", response.status, body);
  }

  const data = await response.json();
  const usage = data.usageMetadata;
  return {
    content: data.candidates[0].content.parts[0].text,
    tokensUsed: {
      input: usage?.promptTokenCount ?? 0,
      output: usage?.candidatesTokenCount ?? 0,
      total: usage?.totalTokenCount ?? 0,
    },
  };
}

async function callGroq(
  config: ProviderConfig,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ProviderError("Groq", response.status, body);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: {
      input: data.usage?.prompt_tokens ?? 0,
      output: data.usage?.completion_tokens ?? 0,
      total: data.usage?.total_tokens ?? 0,
    },
  };
}

async function callOpenRouter(
  config: ProviderConfig,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ProviderError("OpenRouter", response.status, body);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: {
      input: data.usage?.prompt_tokens ?? 0,
      output: data.usage?.completion_tokens ?? 0,
      total: data.usage?.total_tokens ?? 0,
    },
  };
}

const PROVIDER_MAP: Record<AIProvider, typeof callOpenAI> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  gemini: callGemini,
  groq: callGroq,
  openrouter: callOpenRouter,
};

export async function callProvider(
  provider: AIProvider,
  config: ProviderConfig,
  messages: ChatMessage[]
): Promise<ProviderResponse> {
  const handler = PROVIDER_MAP[provider];
  if (!handler) throw new Error(`Unsupported provider: ${provider}`);

  try {
    return await handler(config, messages);
  } catch (error) {
    // Only retry on server errors (5xx). Never retry 4xx (rate limits, auth, bad input).
    if (error instanceof ProviderError && error.status >= 500) {
      await new Promise((r) => setTimeout(r, 2000));
      return await handler(config, messages);
    }
    throw error;
  }
}
