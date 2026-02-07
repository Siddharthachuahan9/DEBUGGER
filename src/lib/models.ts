import { AIModel } from "@/types";

export const MODELS: AIModel[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast, affordable. Good for common errors.",
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    maxTokens: 128000,
    tier: "free",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Most capable OpenAI model. Best for complex bugs.",
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    maxTokens: 128000,
    tier: "pro",
  },
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Excellent reasoning. Great for deep analysis.",
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    maxTokens: 200000,
    tier: "pro",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    description: "Fast and free-tier friendly. Good for quick checks.",
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
    maxTokens: 1000000,
    tier: "free",
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "groq",
    description: "Ultra-fast inference. Good for rapid iteration.",
    costPer1kInput: 0.00059,
    costPer1kOutput: 0.00079,
    maxTokens: 128000,
    tier: "free",
  },
  {
    id: "anthropic/claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5 (OpenRouter)",
    provider: "openrouter",
    description: "Claude via OpenRouter. Single key for all models.",
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    maxTokens: 200000,
    tier: "pro",
  },
];

export function getModel(id: string): AIModel | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getModelsByProvider(provider: string): AIModel[] {
  return MODELS.filter((m) => m.provider === provider);
}

export function estimateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  return (
    (inputTokens / 1000) * model.costPer1kInput +
    (outputTokens / 1000) * model.costPer1kOutput
  );
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
