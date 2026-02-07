"use client";

import { useStore } from "@/store";
import { useCallback, useRef } from "react";
import {
  Terminal,
  Upload,
  X,
  Braces,
  Database,
  FileText,
  Globe,
  Zap,
} from "lucide-react";

const DEBUG_MODES = [
  { id: "general", label: "General", icon: Terminal },
  { id: "json", label: "JSON", icon: Braces },
  { id: "sql", label: "SQL", icon: Database },
  { id: "log", label: "Logs", icon: FileText },
  { id: "curl", label: "cURL", icon: Globe },
] as const;

const EXAMPLES = [
  {
    label: "Python TypeError",
    value: `Traceback (most recent call last):
  File "app.py", line 42, in process_data
    result = data["users"][0]["name"].lower()
TypeError: 'NoneType' object has no attribute 'lower'`,
  },
  {
    label: "Node.js Error",
    value: `Error: ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)
    at Protocol._enqueue (/app/node_modules/pg/lib/protocol.js:28:17)
    at Client.query (/app/node_modules/pg/lib/client.js:95:24)`,
  },
  {
    label: "SQL Query",
    value: `SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC;

ERROR: column "u.name" must appear in the GROUP BY clause or be used in an aggregate function`,
  },
  {
    label: "JSON Parse Error",
    value: `{
  "users": [
    {"id": 1, "name": "Alice", "role": "admin"}
    {"id": 2, "name": "Bob", "role": "user"},
  ],
  "meta": {"total": 2}
}

SyntaxError: Unexpected token '{', ..."le": "admin"}{"id": 2, "na"... is not valid JSON`,
  },
];

export function InputEditor() {
  const { input, setInput, settings, updateSettings, isAnalyzing } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result;
        if (typeof content === "string") {
          setInput(content);
        }
      };
      reader.readAsText(file);
    },
    [setInput]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result;
        if (typeof content === "string") {
          setInput(content);
        }
      };
      reader.readAsText(file);
    },
    [setInput]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Debug Mode Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        {DEBUG_MODES.map((mode) => {
          const Icon = mode.icon;
          const active = settings.debugMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => updateSettings({ debugMode: mode.id as typeof settings.debugMode })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                active
                  ? "bg-accent-muted text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-card-hover"
              }`}
            >
              <Icon size={13} />
              {mode.label}
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
        >
          <Upload size={13} />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".log,.txt,.json,.yaml,.yml,.sql,.env,.toml,.xml,.csv"
          className="hidden"
          onChange={handleFileUpload}
        />

        {input && (
          <button
            onClick={() => setInput("")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-danger hover:bg-card-hover transition-colors"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Textarea */}
      <div
        className="flex-1 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your error, log, stack trace, SQL query, JSON, or any debug input here..."
          disabled={isAnalyzing}
          className="w-full h-full p-4 bg-transparent font-mono text-sm leading-relaxed text-foreground placeholder:text-muted resize-none disabled:opacity-50"
          spellCheck={false}
        />

        {/* Empty State Examples */}
        {!input && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-xs text-muted mb-2.5 font-medium">Try an example:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setInput(ex.value)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs bg-card hover:bg-card-hover text-muted-foreground hover:text-foreground border border-border hover:border-border-hover transition-colors"
                >
                  <Zap size={11} className="text-accent" />
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Stats */}
      {input && (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border text-xs text-muted">
          <span>{input.length.toLocaleString()} chars</span>
          <span>~{Math.ceil(input.length / 4).toLocaleString()} tokens</span>
        </div>
      )}
    </div>
  );
}
