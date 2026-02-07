import { NextRequest, NextResponse } from "next/server";
import { callProvider } from "@/lib/ai/providers";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { detect } from "@/lib/detect";
import { getModel, estimateCost } from "@/lib/models";
import { AnalysisResult, AIProvider } from "@/types";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      input,
      model: modelId,
      provider,
      apiKey,
      strictMode = false,
      explainLevel = "senior",
      debugMode = "general",
    } = body;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required. Add your key in settings." },
        { status: 400 }
      );
    }

    if (input.length > 50000) {
      return NextResponse.json(
        { error: "Input too large. Maximum 50,000 characters." },
        { status: 400 }
      );
    }

    const detection = detect(input);
    const model = getModel(modelId);

    const systemPrompt = buildSystemPrompt({
      explainLevel,
      strictMode,
      debugMode,
      inputType: detection.inputType,
      language: detection.language,
      framework: detection.framework,
      database: detection.database,
      cloud: detection.cloud,
    });

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: `Analyze this and respond with JSON only:\n\n${input}`,
      },
    ];

    const response = await callProvider(
      provider as AIProvider,
      { apiKey, model: modelId },
      messages
    );

    let parsed;
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response.content.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response. Try again or switch models." },
        { status: 500 }
      );
    }

    const cost = model
      ? estimateCost(model, response.tokensUsed.input, response.tokensUsed.output)
      : 0;

    const result: AnalysisResult = {
      id: nanoid(12),
      timestamp: Date.now(),
      input,
      inputType: detection.inputType,
      detectedLanguage: detection.language,
      detectedFramework: detection.framework,
      severity: parsed.severity ?? "info",
      confidence: parsed.confidence ?? 50,
      summary: parsed.summary ?? "Analysis complete",
      rootCause: parsed.rootCause ?? "Unable to determine root cause",
      fixSteps: parsed.fixSteps ?? [],
      codeSnippets: parsed.codeSnippets ?? [],
      prevention: parsed.prevention ?? "",
      model: modelId,
      provider: provider as AIProvider,
      tokensUsed: response.tokensUsed,
      costEstimate: cost,
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
