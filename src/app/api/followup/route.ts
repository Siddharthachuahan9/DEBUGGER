import { NextRequest, NextResponse } from "next/server";
import { callProvider } from "@/lib/ai/providers";
import { buildFollowUpPrompt } from "@/lib/ai/prompts";
import { AIProvider } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originalInput,
      originalAnalysis,
      question,
      model: modelId,
      provider,
      apiKey,
      explainLevel = "senior",
    } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required." },
        { status: 400 }
      );
    }

    const userPrompt = buildFollowUpPrompt(
      originalInput,
      originalAnalysis,
      question,
      explainLevel
    );

    const messages = [
      {
        role: "system" as const,
        content:
          "You are DevHelp AI, a debugging assistant. Answer follow-up questions about the previous analysis. Be direct and helpful.",
      },
      { role: "user" as const, content: userPrompt },
    ];

    const response = await callProvider(
      provider as AIProvider,
      { apiKey, model: modelId },
      messages
    );

    return NextResponse.json({
      content: response.content,
      tokensUsed: response.tokensUsed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Follow-up failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
