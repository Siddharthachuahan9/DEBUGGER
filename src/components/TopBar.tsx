"use client";

import { useStore } from "@/store";
import { MODELS } from "@/lib/models";
import {
  Settings,
  History,
  Share2,
  Keyboard,
  Bug,
  ChevronDown,
  Shield,
  GraduationCap,
  Eye,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

function ModelDropdown() {
  const { settings, updateSettings } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentModel = MODELS.find((m) => m.id === settings.model);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-border hover:border-border-hover text-sm transition-colors"
      >
        <span className="text-foreground font-medium">
          {currentModel?.name ?? settings.model}
        </span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden animate-fade-in">
          {MODELS.map((model) => {
            const hasKey = Boolean(settings.apiKeys[model.provider]);
            return (
              <button
                key={model.id}
                onClick={() => {
                  updateSettings({ model: model.id, provider: model.provider });
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-card-hover transition-colors border-b border-border last:border-0 ${
                  settings.model === model.id ? "bg-accent-muted" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {model.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {model.tier === "pro" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-muted text-accent font-medium">
                        PRO
                      </span>
                    )}
                    {!hasKey && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                        No key
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {model.description}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const {
    settings,
    updateSettings,
    setShowSettings,
    setShowHistory,
    setShowCommandPalette,
    currentResult,
  } = useStore();

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/50">
      {/* Left: Logo + Model */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Bug size={15} className="text-white" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">
            DevHelp AI
          </span>
        </div>

        <div className="w-px h-5 bg-border" />

        <ModelDropdown />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Strict Mode Toggle */}
        <button
          onClick={() => updateSettings({ strictMode: !settings.strictMode })}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            settings.strictMode
              ? "bg-warning/10 text-warning"
              : "text-muted-foreground hover:text-foreground hover:bg-card-hover"
          }`}
          title="Strict Mode — no speculation"
        >
          <Shield size={13} />
          Strict
        </button>

        {/* Explain Level Toggle */}
        <button
          onClick={() =>
            updateSettings({
              explainLevel:
                settings.explainLevel === "senior" ? "beginner" : "senior",
            })
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            settings.explainLevel === "beginner"
              ? "bg-info/10 text-info"
              : "text-muted-foreground hover:text-foreground hover:bg-card-hover"
          }`}
          title={`Explain level: ${settings.explainLevel}`}
        >
          <GraduationCap size={13} />
          {settings.explainLevel === "senior" ? "Senior" : "Beginner"}
        </button>

        {/* Privacy Mode Toggle */}
        <button
          onClick={() =>
            updateSettings({ privacyMode: !settings.privacyMode })
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            settings.privacyMode
              ? "bg-success/10 text-success"
              : "text-muted-foreground hover:text-foreground hover:bg-card-hover"
          }`}
          title="Privacy Mode — no server storage"
        >
          <Eye size={13} />
          Privacy
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* History */}
        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
          title="History"
        >
          <History size={13} />
        </button>

        {/* Share */}
        {currentResult && (
          <button
            onClick={() => {
              const data = btoa(
                encodeURIComponent(JSON.stringify(currentResult))
              );
              const url = `${window.location.origin}/share?d=${data.slice(0, 2000)}`;
              navigator.clipboard.writeText(url);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
            title="Copy share link"
          >
            <Share2 size={13} />
          </button>
        )}

        {/* Command Palette */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
          title="Command Palette (⌘K)"
        >
          <Keyboard size={13} />
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
          title="Settings"
        >
          <Settings size={13} />
        </button>
      </div>
    </header>
  );
}
