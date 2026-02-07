"use client";

import { useStore } from "@/store";
import {
  Search,
  Sparkles,
  History,
  Settings,
  Trash2,
  Shield,
  GraduationCap,
  Eye,
  Braces,
  Database,
  FileText,
  Globe,
  Terminal,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

type Command = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  shortcut?: string;
};

export function CommandPalette() {
  const {
    showCommandPalette,
    setShowCommandPalette,
    setShowSettings,
    setShowHistory,
    settings,
    updateSettings,
    clearWorkspace,
    clearHistory,
  } = useStore();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "settings",
        label: "Open Settings",
        description: "Configure API keys",
        icon: Settings,
        action: () => {
          setShowCommandPalette(false);
          setShowSettings(true);
        },
        shortcut: "⌘,",
      },
      {
        id: "history",
        label: "Open History",
        description: "View past analyses",
        icon: History,
        action: () => {
          setShowCommandPalette(false);
          setShowHistory(true);
        },
        shortcut: "⌘H",
      },
      {
        id: "clear",
        label: "Clear Workspace",
        description: "Reset input and output",
        icon: Trash2,
        action: () => {
          clearWorkspace();
          setShowCommandPalette(false);
        },
        shortcut: "⌘L",
      },
      {
        id: "strict",
        label: `Strict Mode: ${settings.strictMode ? "ON" : "OFF"}`,
        description: "Toggle no-hallucination mode",
        icon: Shield,
        action: () => {
          updateSettings({ strictMode: !settings.strictMode });
          setShowCommandPalette(false);
        },
      },
      {
        id: "explain",
        label: `Explain: ${settings.explainLevel === "senior" ? "Senior" : "Beginner"}`,
        description: "Toggle explain level",
        icon: GraduationCap,
        action: () => {
          updateSettings({
            explainLevel:
              settings.explainLevel === "senior" ? "beginner" : "senior",
          });
          setShowCommandPalette(false);
        },
      },
      {
        id: "privacy",
        label: `Privacy: ${settings.privacyMode ? "ON" : "OFF"}`,
        description: "Toggle privacy mode",
        icon: Eye,
        action: () => {
          updateSettings({ privacyMode: !settings.privacyMode });
          setShowCommandPalette(false);
        },
      },
      {
        id: "mode-general",
        label: "General Mode",
        description: "Analyze any error type",
        icon: Terminal,
        action: () => {
          updateSettings({ debugMode: "general" });
          setShowCommandPalette(false);
        },
      },
      {
        id: "mode-json",
        label: "JSON Debug Mode",
        description: "Debug JSON parsing issues",
        icon: Braces,
        action: () => {
          updateSettings({ debugMode: "json" });
          setShowCommandPalette(false);
        },
      },
      {
        id: "mode-sql",
        label: "SQL Debug Mode",
        description: "Debug SQL queries",
        icon: Database,
        action: () => {
          updateSettings({ debugMode: "sql" });
          setShowCommandPalette(false);
        },
      },
      {
        id: "mode-log",
        label: "Log Parser Mode",
        description: "Parse and analyze logs",
        icon: FileText,
        action: () => {
          updateSettings({ debugMode: "log" });
          setShowCommandPalette(false);
        },
      },
      {
        id: "mode-curl",
        label: "cURL Debug Mode",
        description: "Debug API requests",
        icon: Globe,
        action: () => {
          updateSettings({ debugMode: "curl" });
          setShowCommandPalette(false);
        },
      },
      {
        id: "clear-history",
        label: "Clear History",
        description: "Delete all saved analyses",
        icon: Trash2,
        action: () => {
          clearHistory();
          setShowCommandPalette(false);
        },
      },
    ],
    [
      settings,
      setShowCommandPalette,
      setShowSettings,
      setShowHistory,
      updateSettings,
      clearWorkspace,
      clearHistory,
    ]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return commands;
    const q = search.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [commands, search]);

  useEffect(() => {
    setSelected(0);
  }, [search]);

  useEffect(() => {
    if (showCommandPalette) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showCommandPalette]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => (s + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => (s - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[selected]?.action();
      } else if (e.key === "Escape") {
        setShowCommandPalette(false);
      }
    },
    [filtered, selected, setShowCommandPalette]
  );

  if (!showCommandPalette) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowCommandPalette(false);
      }}
    >
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted"
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No commands found
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selected
                      ? "bg-accent-muted"
                      : "hover:bg-card-hover"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      i === selected ? "text-accent" : "text-muted-foreground"
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{cmd.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {cmd.description}
                    </p>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted font-mono">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
