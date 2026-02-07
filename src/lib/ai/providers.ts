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
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} — ${error}`);
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
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} — ${error}`);
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
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} — ${error}`);
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
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${error}`);
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
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${error}`);
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

  // Retry once on failure
  try {
    return await handler(config, messages);
  } catch (error) {
    // Single retry
    return await handler(config, messages);
  }
}
