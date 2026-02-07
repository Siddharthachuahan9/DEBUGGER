"use client";

import { useStore } from "@/store";
import { HistoryEntry } from "@/types";
import {
  X,
  Clock,
  Trash2,
  AlertTriangle,
  Info,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";

function SeverityDot({ severity }: { severity: string }) {
  const color =
    severity === "critical"
      ? "bg-danger"
      : severity === "warning"
        ? "bg-warning"
        : "bg-info";
  return <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function HistoryItem({
  entry,
  onSelect,
}: {
  entry: HistoryEntry;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-3 rounded-lg hover:bg-card-hover border border-transparent hover:border-border transition-colors"
    >
      <div className="flex items-start gap-2.5">
        <SeverityDot severity={entry.severity} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-medium leading-tight truncate">
            {entry.summary}
          </p>
          <p className="text-xs text-muted truncate mt-0.5">
            {entry.inputPreview}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-muted-foreground capitalize px-1.5 py-0.5 rounded bg-card">
              {entry.inputType}
            </span>
            <span className="text-[10px] text-muted">
              {formatTime(entry.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function HistoryPanel() {
  const {
    showHistory,
    setShowHistory,
    history,
    clearHistory,
    loadFromHistory,
  } = useStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return history;
    const q = search.toLowerCase();
    return history.filter(
      (h) =>
        h.summary.toLowerCase().includes(q) ||
        h.inputPreview.toLowerCase().includes(q) ||
        h.inputType.includes(q)
    );
  }, [history, search]);

  if (!showHistory) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowHistory(false);
      }}
    >
      <div className="w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-accent" />
            <h2 className="text-sm font-semibold text-foreground">History</h2>
            <span className="text-xs text-muted">({history.length})</span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-card-hover text-muted-foreground hover:text-danger transition-colors"
                title="Clear history"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={() => setShowHistory(false)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        {history.length > 3 && (
          <div className="px-4 py-2 border-b border-border">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info size={20} className="text-muted mb-2" />
              <p className="text-sm text-muted-foreground">
                {history.length === 0
                  ? "No analyses yet"
                  : "No matches found"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((entry) => (
                <HistoryItem
                  key={entry.id}
                  entry={entry}
                  onSelect={() => {
                    loadFromHistory(entry);
                    setShowHistory(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
