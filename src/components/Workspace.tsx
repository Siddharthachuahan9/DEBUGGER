"use client";

import { useStore } from "@/store";
import { InputEditor } from "@/components/InputEditor";
import { AnalysisOutput } from "@/components/AnalysisOutput";
import { FollowUp } from "@/components/FollowUp";
import { TopBar } from "@/components/TopBar";
import { SettingsModal } from "@/components/SettingsModal";
import { HistoryPanel } from "@/components/HistoryPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { HistoryEntry } from "@/types";
import { Loader2, Sparkles } from "lucide-react";
import { useCallback } from "react";
import { nanoid } from "nanoid";

export function Workspace() {
  const {
    input,
    isAnalyzing,
    settings,
    setAnalyzing,
    setResult,
    setError,
    addToHistory,
    clearFollowUps,
  } = useStore();

  const handleAnalyze = useCallback(async () => {
    if (!input.trim() || isAnalyzing) return;

    const apiKey = settings.apiKeys[settings.provider];
    if (!apiKey) {
      setError(
        `No API key configured for ${settings.provider}. Open settings (⌘,) and add your key.`
      );
      return;
    }

    setAnalyzing(true);
    setError(null);
    clearFollowUps();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          model: settings.model,
          provider: settings.provider,
          apiKey,
          strictMode: settings.strictMode,
          explainLevel: settings.explainLevel,
          debugMode: settings.debugMode,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setAnalyzing(false);
        return;
      }

      setResult(data);
      setAnalyzing(false);

      // Save to history
      if (!settings.privacyMode) {
        const entry: HistoryEntry = {
          id: data.id,
          timestamp: data.timestamp,
          inputPreview: input.trim().slice(0, 100),
          inputType: data.inputType,
          severity: data.severity,
          summary: data.summary,
          result: data,
        };
        addToHistory(entry);
      }
    } catch (err) {
      setError("Network error. Check your connection and try again.");
      setAnalyzing(false);
    }
  }, [
    input,
    isAnalyzing,
    settings,
    setAnalyzing,
    setResult,
    setError,
    addToHistory,
    clearFollowUps,
  ]);

  // Cmd+Enter to analyze
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleAnalyze();
      }
    },
    [handleAnalyze]
  );

  return (
    <div className="h-screen flex flex-col" onKeyDown={handleKeyDown}>
      <KeyboardShortcuts />

      <TopBar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Panel — Input */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-border min-h-0">
          <div className="flex-1 min-h-0">
            <InputEditor />
          </div>

          {/* Analyze Button */}
          <div className="p-3 border-t border-border">
            <button
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent text-white text-sm font-medium transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Analyze
                  <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-mono">
                    ⌘↵
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel — Output */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <AnalysisOutput />
          </div>
          <FollowUp />
        </div>
      </div>

      {/* Modals */}
      <SettingsModal />
      <HistoryPanel />
      <CommandPalette />
    </div>
  );
}
