import { ExplainLevel, InputType } from "@/types";

function getDebugModeInstructions(mode: string): string {
  switch (mode) {
    case "json":
      return `
You are in JSON Debug Mode. Focus on:
- Exact location of syntax errors (line, character)
- Missing/extra commas, brackets, quotes
- Schema validation issues
- Type mismatches
- Provide corrected JSON output`;
    case "sql":
      return `
You are in SQL Debug Mode. Focus on:
- Query syntax errors
- Performance issues (missing indexes, full table scans)
- Join problems
- Suggest EXPLAIN ANALYZE interpretation
- Provide optimized query rewrite`;
    case "log":
      return `
You are in Log Parser Mode. Focus on:
- Extract errors and warnings from log lines
- Reconstruct timeline of events
- Identify anomalies and patterns
- Group related entries
- Highlight root cause entry`;
    case "curl":
      return `
You are in cURL Debug Mode. Focus on:
- Request/response analysis
- Header issues (auth, content-type, CORS)
- SSL/TLS problems
- DNS/network issues
- Provide equivalent code in multiple languages`;
    default:
      return "";
  }
}

export function buildSystemPrompt(options: {
  explainLevel: ExplainLevel;
  strictMode: boolean;
  debugMode: string;
  inputType: InputType;
  language: string | null;
  framework: string | null;
  database: string | null;
  cloud: string | null;
}): string {
  const {
    explainLevel,
    strictMode,
    debugMode,
    inputType,
    language,
    framework,
    database,
    cloud,
  } = options;

  const levelInstructions =
    explainLevel === "senior"
      ? "Explain as a senior engineer. Be technical, precise, concise. Assume competence. Include edge cases and performance notes."
      : "Explain clearly for a beginner. Define technical terms. Add context. Be thorough but approachable. Link concepts to fundamentals.";

  const strictInstructions = strictMode
    ? `STRICT MODE ACTIVE: Only reference information present in the input. If uncertain, say "I'm not confident about this." Never speculate or hallucinate. If you don't have enough information, say so clearly.`
    : "";

  const contextParts: string[] = [];
  if (language) contextParts.push(`Language: ${language}`);
  if (framework) contextParts.push(`Framework: ${framework}`);
  if (database) contextParts.push(`Database: ${database}`);
  if (cloud) contextParts.push(`Cloud: ${cloud}`);
  const contextStr = contextParts.length
    ? `\nDetected context: ${contextParts.join(", ")}`
    : "";

  return `You are DevHelp AI, an expert debugging assistant. You analyze errors, logs, stack traces, SQL queries, API failures, JSON, and config issues.

Your job: Identify the root cause and provide actionable fixes.

${levelInstructions}

${strictInstructions}

${getDebugModeInstructions(debugMode)}

Input type detected: ${inputType}${contextStr}

RESPONSE FORMAT — You MUST respond with valid JSON matching this exact structure:
{
  "summary": "One-line summary of what went wrong",
  "rootCause": "Detailed explanation of the root cause",
  "severity": "critical" | "warning" | "info",
  "confidence": 0-100,
  "fixSteps": [
    {
      "step": 1,
      "title": "Short title",
      "description": "What to do and why",
      "command": "terminal command if applicable (optional)",
      "code": "code fix if applicable (optional)",
      "effort": "quick" | "moderate" | "architectural"
    }
  ],
  "codeSnippets": [
    {
      "language": "language name",
      "label": "What this snippet does",
      "code": "the code"
    }
  ],
  "prevention": "How to prevent this in the future"
}

Rules:
- Always provide at least one fix step
- Order fix steps from quickest to most thorough
- Include copy-ready commands when applicable
- Code snippets should be complete and runnable
- Be specific to the detected language/framework
- Never include markdown formatting in the JSON — raw JSON only`;
}

export function buildFollowUpPrompt(
  originalInput: string,
  originalAnalysis: string,
  question: string,
  explainLevel: ExplainLevel
): string {
  const level =
    explainLevel === "senior"
      ? "Answer technically and concisely."
      : "Answer clearly for a beginner.";

  return `Context — the user previously submitted this for debugging:

---INPUT---
${originalInput}
---END INPUT---

Your previous analysis:
${originalAnalysis}

The user now asks: "${question}"

${level}

Respond in plain text (not JSON). Be direct and helpful. Include code blocks with language tags when showing code.`;
}
