"use client";

import { useStore } from "@/store";
import { AIProvider } from "@/types";
import { X, Key, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const PROVIDERS: { id: AIProvider; name: string; placeholder: string }[] = [
  { id: "openai", name: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-..." },
  { id: "gemini", name: "Google Gemini", placeholder: "AIza..." },
  { id: "groq", name: "Groq", placeholder: "gsk_..." },
  { id: "openrouter", name: "OpenRouter", placeholder: "sk-or-..." },
];

export function SettingsModal() {
  const { showSettings, setShowSettings, settings, setApiKey } = useStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  if (!showSettings) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowSettings(false);
      }}
    >
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-accent" />
            <h2 className="text-base font-semibold text-foreground">
              API Keys
            </h2>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your API keys are stored locally in your browser. They are never
            sent to our servers — only directly to the AI provider you select.
          </p>

          {PROVIDERS.map((provider) => {
            const value = settings.apiKeys[provider.id] ?? "";
            const visible = showKeys[provider.id];

            return (
              <div key={provider.id}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {provider.name}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={visible ? "text" : "password"}
                      value={value}
                      onChange={(e) =>
                        setApiKey(provider.id, e.target.value)
                      }
                      placeholder={provider.placeholder}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted font-mono"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setShowKeys((s) => ({
                        ...s,
                        [provider.id]: !s[provider.id],
                      }))
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
