"use client";

import { useStore } from "@/store";
import { AnalysisResult, FixStep, CodeSnippet } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Copy,
  Check,
  Shield,
  Zap,
  Code2,
  ChevronRight,
  Bug,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { useState, useCallback } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config = {
    critical: {
      icon: AlertTriangle,
      label: "Critical",
      className: "text-danger bg-danger/10 border-danger/20",
    },
    warning: {
      icon: AlertTriangle,
      label: "Warning",
      className: "text-warning bg-warning/10 border-warning/20",
    },
    info: {
      icon: Info,
      label: "Info",
      className: "text-info bg-info/10 border-info/20",
    },
  }[severity] ?? {
    icon: Info,
    label: severity,
    className: "text-muted bg-card border-border",
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color =
    confidence >= 80
      ? "text-success"
      : confidence >= 50
        ? "text-warning"
        : "text-danger";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Shield size={11} />
      {confidence}% confidence
    </span>
  );
}

function EffortBadge({ effort }: { effort: string }) {
  const config = {
    quick: { label: "Quick fix", className: "text-success bg-success/10" },
    moderate: { label: "Moderate", className: "text-warning bg-warning/10" },
    architectural: { label: "Architectural", className: "text-info bg-info/10" },
  }[effort] ?? { label: effort, className: "text-muted bg-card" };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function FixStepCard({ fix }: { fix: FixStep }) {
  return (
    <div className="animate-fade-in border border-border rounded-lg p-4 hover:border-border-hover transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-muted text-accent text-xs font-bold shrink-0 mt-0.5">
          {fix.step}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-sm font-medium text-foreground">{fix.title}</h4>
            <EffortBadge effort={fix.effort} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {fix.description}
          </p>

          {fix.command && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                  Command
                </span>
                <CopyButton text={fix.command} />
              </div>
              <pre className="bg-background rounded-md p-3 text-xs font-mono text-foreground overflow-x-auto border border-border">
                <code>$ {fix.command}</code>
              </pre>
            </div>
          )}

          {fix.code && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                  Code
                </span>
                <CopyButton text={fix.code} />
              </div>
              <pre className="bg-background rounded-md p-3 text-xs font-mono text-foreground overflow-x-auto border border-border leading-relaxed">
                <code>{fix.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeSnippetCard({ snippet }: { snippet: CodeSnippet }) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Code2 size={12} className="text-accent" />
          <span className="text-xs font-medium text-muted-foreground">
            {snippet.label}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-card text-muted font-mono">
            {snippet.language}
          </span>
        </div>
        <CopyButton text={snippet.code} />
      </div>
      <pre className="bg-background rounded-md p-3 text-xs font-mono text-foreground overflow-x-auto border border-border leading-relaxed">
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <div className="h-5 w-48 animate-shimmer rounded" />
        <div className="h-4 w-full animate-shimmer rounded" />
        <div className="h-4 w-3/4 animate-shimmer rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-5 w-32 animate-shimmer rounded" />
        <div className="h-20 w-full animate-shimmer rounded-lg" />
      </div>
      <div className="space-y-3">
        <div className="h-5 w-36 animate-shimmer rounded" />
        <div className="h-24 w-full animate-shimmer rounded-lg" />
        <div className="h-24 w-full animate-shimmer rounded-lg" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center mb-4">
        <Bug size={24} className="text-accent" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">
        Paste an error to analyze
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Paste any error, stack trace, log, SQL query, or JSON in the editor.
        DevHelp AI will identify the root cause and suggest fixes.
      </p>
      <div className="flex items-center gap-2 mt-6 text-xs text-muted">
        <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono">
          ⌘
        </kbd>
        <span>+</span>
        <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono">
          Enter
        </kbd>
        <span className="text-muted-foreground">to analyze</span>
      </div>
    </div>
  );
}

function ResultView({ result }: { result: AnalysisResult }) {
  return (
    <div className="p-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={result.severity} />
          <ConfidenceBadge confidence={result.confidence} />
          {result.detectedLanguage && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">
              {result.detectedLanguage}
            </span>
          )}
          {result.detectedFramework && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">
              {result.detectedFramework}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground capitalize">
            {result.inputType}
          </span>
        </div>

        {/* Summary */}
        <div>
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            {result.summary}
          </h3>
        </div>
      </div>

      {/* Root Cause */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Lightbulb size={14} className="text-warning" />
          <h4 className="text-xs uppercase tracking-wider font-semibold text-muted">
            Root Cause
          </h4>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {result.rootCause}
          </p>
        </div>
      </div>

      {/* Fix Steps */}
      {result.fixSteps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-success" />
            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted">
              Fix Steps
            </h4>
            <span className="text-xs text-muted">
              ({result.fixSteps.length})
            </span>
          </div>
          <div className="space-y-3">
            {result.fixSteps.map((fix, i) => (
              <FixStepCard key={i} fix={fix} />
            ))}
          </div>
        </div>
      )}

      {/* Code Snippets */}
      {result.codeSnippets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={14} className="text-accent" />
            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted">
              Code Snippets
            </h4>
          </div>
          <div className="space-y-3">
            {result.codeSnippets.map((snippet, i) => (
              <CodeSnippetCard key={i} snippet={snippet} />
            ))}
          </div>
        </div>
      )}

      {/* Prevention */}
      {result.prevention && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Shield size={14} className="text-info" />
            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted">
              Prevention
            </h4>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {result.prevention}
            </p>
          </div>
        </div>
      )}

      {/* Token Usage */}
      <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted">
        <span className="flex items-center gap-1">
          <Zap size={11} />
          {result.tokensUsed.total.toLocaleString()} tokens
        </span>
        <span>
          <ArrowRight size={10} className="inline" /> {result.tokensUsed.input.toLocaleString()} in
        </span>
        <span>
          <ChevronRight size={10} className="inline" /> {result.tokensUsed.output.toLocaleString()} out
        </span>
        {result.costEstimate > 0 && (
          <span>${result.costEstimate.toFixed(4)}</span>
        )}
        <span className="capitalize">{result.model}</span>
      </div>
    </div>
  );
}

export function AnalysisOutput() {
  const { isAnalyzing, currentResult, error } = useStore();

  if (isAnalyzing) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8">
        <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center mb-4">
          <AlertTriangle size={24} className="text-danger" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          Analysis Failed
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (!currentResult) return <EmptyState />;

  return (
    <div className="h-full overflow-y-auto">
      <ResultView result={currentResult} />
    </div>
  );
}
