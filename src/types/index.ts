export type AIProvider = "openai" | "anthropic" | "gemini" | "groq" | "openrouter";

export type AIModel = {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  costPer1kInput: number;
  costPer1kOutput: number;
  maxTokens: number;
  tier: "free" | "pro";
};

export type InputType =
  | "stacktrace"
  | "log"
  | "sql"
  | "api"
  | "json"
  | "config"
  | "build"
  | "runtime"
  | "unknown";

export type Severity = "critical" | "warning" | "info";

export type ExplainLevel = "senior" | "beginner";

export type AnalysisRequest = {
  input: string;
  model: string;
  provider: AIProvider;
  strictMode: boolean;
  explainLevel: ExplainLevel;
  debugMode?: "general" | "json" | "sql" | "log" | "curl";
};

export type AnalysisResult = {
  id: string;
  timestamp: number;
  input: string;
  inputType: InputType;
  detectedLanguage: string | null;
  detectedFramework: string | null;
  severity: Severity;
  confidence: number;
  summary: string;
  rootCause: string;
  fixSteps: FixStep[];
  codeSnippets: CodeSnippet[];
  prevention: string;
  model: string;
  provider: AIProvider;
  tokensUsed: { input: number; output: number; total: number };
  costEstimate: number;
};

export type FixStep = {
  step: number;
  title: string;
  description: string;
  command?: string;
  code?: string;
  effort: "quick" | "moderate" | "architectural";
};

export type CodeSnippet = {
  language: string;
  label: string;
  code: string;
};

export type HistoryEntry = {
  id: string;
  timestamp: number;
  inputPreview: string;
  inputType: InputType;
  severity: Severity;
  summary: string;
  result: AnalysisResult;
};

export type UserSettings = {
  provider: AIProvider;
  model: string;
  apiKeys: Partial<Record<AIProvider, string>>;
  strictMode: boolean;
  explainLevel: ExplainLevel;
  privacyMode: boolean;
  debugMode: "general" | "json" | "sql" | "log" | "curl";
};

export type FollowUpMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};
