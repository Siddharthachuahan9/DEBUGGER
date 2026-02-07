"use client";

import { useState } from "react";
import { Workspace } from "@/components/Workspace";
import {
  Bug,
  Zap,
  Shield,
  Code2,
  Braces,
  Database,
  FileText,
  Globe,
  ArrowRight,
  Sparkles,
  Lock,
  Key,
  Share2,
  Keyboard,
  Terminal,
  CheckCircle2,
} from "lucide-react";

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-card border border-border hover:border-border-hover transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-accent-muted flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
        <Icon size={18} className="text-accent" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function InputTypeChip({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
      <Icon size={12} className="text-accent" />
      {label}
    </div>
  );
}

function PricingTier({
  name,
  price,
  description,
  features,
  highlight,
  cta,
  onCta,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div
      className={`p-6 rounded-xl border ${
        highlight
          ? "border-accent bg-accent-muted"
          : "border-border bg-card"
      } flex flex-col`}
    >
      <h3 className="text-lg font-bold text-foreground">{name}</h3>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-3xl font-bold text-foreground">{price}</span>
        {price !== "Free" && price !== "Custom" && (
          <span className="text-sm text-muted-foreground">/month</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{description}</p>
      <ul className="mt-4 space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        className={`w-full mt-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          highlight
            ? "bg-accent hover:bg-accent-hover text-white"
            : "bg-card-hover hover:bg-border text-foreground"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Bug size={15} className="text-white" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">
            DevHelp AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <button
            onClick={onLaunch}
            className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/20 mb-6">
          <Sparkles size={12} className="text-accent" />
          <span className="text-xs font-medium text-accent">
            AI-Powered Debugging
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
          Debug any error
          <br />
          <span className="text-accent">in seconds</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
          Paste any error, stack trace, log, SQL query, or JSON.
          Get instant root cause analysis and copy-ready fix suggestions.
        </p>

        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={onLaunch}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
          >
            Start Debugging
            <ArrowRight size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock size={12} />
            No signup required
          </div>
        </div>

        {/* Supported Input Types */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
          <InputTypeChip icon={Terminal} label="Stack Traces" />
          <InputTypeChip icon={FileText} label="Logs" />
          <InputTypeChip icon={Database} label="SQL Errors" />
          <InputTypeChip icon={Globe} label="API Failures" />
          <InputTypeChip icon={Braces} label="JSON" />
          <InputTypeChip icon={Code2} label="Build Errors" />
        </div>
      </section>

      {/* Demo Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-danger/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
            <span className="ml-2 text-xs text-muted">devhelp.ai</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[300px]">
            <div className="p-6 border-r border-border">
              <pre className="text-xs font-mono text-muted-foreground leading-relaxed">
{`Traceback (most recent call last):
  File "app.py", line 42, in process_data
    result = data["users"][0]["name"].lower()
TypeError: 'NoneType' object has no attribute 'lower'`}
              </pre>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20 font-medium">
                  Critical
                </span>
                <span className="text-xs text-success font-medium">92% confidence</span>
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                NoneType attribute access on nullable field
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The &quot;name&quot; field in the first user object is None. Calling .lower() on None
                raises TypeError. The data source is returning null for this field.
              </p>
              <div className="bg-background rounded-md p-3 border border-border">
                <code className="text-xs font-mono text-foreground">
                  result = data[&quot;users&quot;][0].get(&quot;name&quot;, &quot;&quot;).lower()
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Everything you need to debug faster
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Purpose-built for developers who want answers, not chat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={Zap}
            title="Instant Analysis"
            description="Paste any error and get structured root cause analysis in seconds. No setup required."
          />
          <FeatureCard
            icon={Shield}
            title="Strict Mode"
            description="No hallucination mode. AI only references information in your input. Zero speculation."
          />
          <FeatureCard
            icon={Code2}
            title="Copy-Ready Fixes"
            description="Every suggestion includes code snippets and terminal commands you can copy and run immediately."
          />
          <FeatureCard
            icon={Key}
            title="Bring Your Own Key"
            description="Use your own API key for unlimited analysis. Keys stored locally, never on our servers."
          />
          <FeatureCard
            icon={Database}
            title="Multi-Mode Debugging"
            description="Specialized modes for JSON, SQL, logs, and cURL. Each mode optimizes analysis for that format."
          />
          <FeatureCard
            icon={Share2}
            title="Share Analysis"
            description="Generate shareable links for any analysis. Perfect for team debugging in Slack or Discord."
          />
          <FeatureCard
            icon={Keyboard}
            title="Keyboard First"
            description="Full keyboard shortcuts. Command palette (Cmd+K). Designed for developers who live in the terminal."
          />
          <FeatureCard
            icon={Globe}
            title="Multi-Provider"
            description="OpenAI, Claude, Gemini, Groq, OpenRouter. Pick the best model for your needs and budget."
          />
          <FeatureCard
            icon={Lock}
            title="Privacy First"
            description="Privacy mode ensures nothing is stored. Your code and errors stay on your machine."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Simple pricing
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Start free. Bring your own key for unlimited. Upgrade for power features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PricingTier
            name="Free"
            price="Free"
            description="Perfect for trying DevHelp AI"
            features={[
              "10 analyses per day",
              "GPT-4o Mini & Gemini Flash",
              "7-day history",
              "Share links",
              "JSON debug mode",
            ]}
            cta="Start Free"
            onCta={onLaunch}
          />
          <PricingTier
            name="Pro"
            price="$12"
            description="For developers who debug daily"
            features={[
              "Unlimited analyses",
              "All models (GPT-4o, Claude, Gemini Pro)",
              "All debug modes",
              "Unlimited history",
              "Export PDF reports",
              "Priority processing",
            ]}
            highlight
            cta="Start Pro"
            onCta={onLaunch}
          />
          <PricingTier
            name="BYOK"
            price="Free"
            description="Use your own API keys"
            features={[
              "Unlimited analyses",
              "All models",
              "All debug modes",
              "Full history",
              "You pay API costs directly",
              "Keys stored locally only",
            ]}
            cta="Start with Your Key"
            onCta={onLaunch}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
              <Bug size={11} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              DevHelp AI
            </span>
          </div>
          <p className="text-xs text-muted">
            Built for developers who hate debugging.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <Workspace />;
  }

  return <LandingPage onLaunch={() => setShowApp(true)} />;
}
