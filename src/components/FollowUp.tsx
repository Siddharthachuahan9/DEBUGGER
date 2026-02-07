"use client";

import { useStore } from "@/store";
import { FollowUpMessage } from "@/types";
import { Send, Loader2 } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { nanoid } from "nanoid";

export function FollowUp() {
  const {
    currentResult,
    followUps,
    addFollowUp,
    settings,
  } = useStore();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || !currentResult || loading) return;

    const userMsg: FollowUpMessage = {
      id: nanoid(8),
      role: "user",
      content: question.trim(),
      timestamp: Date.now(),
    };
    addFollowUp(userMsg);
    setQuestion("");
    setLoading(true);

    try {
      const apiKey = settings.apiKeys[settings.provider];
      if (!apiKey) {
        addFollowUp({
          id: nanoid(8),
          role: "assistant",
          content: "No API key configured for this provider. Add your key in settings.",
          timestamp: Date.now(),
        });
        return;
      }

      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalInput: currentResult.input,
          originalAnalysis: currentResult.summary + "\n" + currentResult.rootCause,
          question: question.trim(),
          model: settings.model,
          provider: settings.provider,
          apiKey,
          explainLevel: settings.explainLevel,
        }),
      });

      const data = await res.json();
      if (data.error) {
        addFollowUp({
          id: nanoid(8),
          role: "assistant",
          content: `Error: ${data.error}`,
          timestamp: Date.now(),
        });
      } else {
        addFollowUp({
          id: nanoid(8),
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
        });
      }
    } catch {
      addFollowUp({
        id: nanoid(8),
        role: "assistant",
        content: "Failed to get response. Check your connection and try again.",
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [question, currentResult, loading, settings, addFollowUp]);

  if (!currentResult) return null;

  return (
    <div className="border-t border-border">
      {/* Follow-up Messages */}
      {followUps.length > 0 && (
        <div className="max-h-60 overflow-y-auto p-4 space-y-3">
          {followUps.map((msg) => (
            <div
              key={msg.id}
              className={`text-sm ${
                msg.role === "user"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-muted mr-2">
                {msg.role === "user" ? "You" : "AI"}
              </span>
              <span className="whitespace-pre-wrap">{msg.content}</span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 size={12} className="animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-3">
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={!question.trim() || loading}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent hover:bg-accent-hover text-white disabled:opacity-30 disabled:hover:bg-accent transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
