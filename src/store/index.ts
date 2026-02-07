import { create } from "zustand";
import {
  AnalysisResult,
  HistoryEntry,
  UserSettings,
  FollowUpMessage,
  AIProvider,
  ExplainLevel,
} from "@/types";

type AppState = {
  // Input
  input: string;
  setInput: (input: string) => void;

  // Analysis
  isAnalyzing: boolean;
  currentResult: AnalysisResult | null;
  error: string | null;
  setAnalyzing: (analyzing: boolean) => void;
  setResult: (result: AnalysisResult | null) => void;
  setError: (error: string | null) => void;

  // Follow-ups
  followUps: FollowUpMessage[];
  addFollowUp: (msg: FollowUpMessage) => void;
  clearFollowUps: () => void;

  // History
  history: HistoryEntry[];
  addToHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  loadFromHistory: (entry: HistoryEntry) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  setApiKey: (provider: AIProvider, key: string) => void;

  // UI
  showSettings: boolean;
  showHistory: boolean;
  showCommandPalette: boolean;
  setShowSettings: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;

  // Share
  shareId: string | null;
  setShareId: (id: string | null) => void;

  // Reset
  clearWorkspace: () => void;
};

const DEFAULT_SETTINGS: UserSettings = {
  provider: "openai",
  model: "gpt-4o-mini",
  apiKeys: {},
  strictMode: false,
  explainLevel: "senior" as ExplainLevel,
  privacyMode: false,
  debugMode: "general",
};

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("devhelp-history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("devhelp-history", JSON.stringify(history.slice(0, 100)));
  } catch {
    // Storage full — skip
  }
}

function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("devhelp-settings");
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: UserSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("devhelp-settings", JSON.stringify(settings));
  } catch {
    // Storage full — skip
  }
}

export const useStore = create<AppState>((set, get) => ({
  // Input
  input: "",
  setInput: (input) => set({ input }),

  // Analysis
  isAnalyzing: false,
  currentResult: null,
  error: null,
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setResult: (currentResult) => set({ currentResult, error: null }),
  setError: (error) => set({ error, isAnalyzing: false }),

  // Follow-ups
  followUps: [],
  addFollowUp: (msg) => set((s) => ({ followUps: [...s.followUps, msg] })),
  clearFollowUps: () => set({ followUps: [] }),

  // History
  history: loadHistory(),
  addToHistory: (entry) => {
    const next = [entry, ...get().history].slice(0, 100);
    saveHistory(next);
    set({ history: next });
  },
  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },
  loadFromHistory: (entry) => {
    set({
      input: entry.result.input,
      currentResult: entry.result,
      followUps: [],
      error: null,
    });
  },

  // Settings
  settings: loadSettings(),
  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    saveSettings(next);
    set({ settings: next });
  },
  setApiKey: (provider, key) => {
    const next = {
      ...get().settings,
      apiKeys: { ...get().settings.apiKeys, [provider]: key },
    };
    saveSettings(next);
    set({ settings: next });
  },

  // UI
  showSettings: false,
  showHistory: false,
  showCommandPalette: false,
  setShowSettings: (showSettings) => set({ showSettings }),
  setShowHistory: (showHistory) => set({ showHistory }),
  setShowCommandPalette: (showCommandPalette) => set({ showCommandPalette }),

  // Share
  shareId: null,
  setShareId: (shareId) => set({ shareId }),

  // Reset
  clearWorkspace: () =>
    set({
      input: "",
      currentResult: null,
      error: null,
      followUps: [],
      shareId: null,
    }),
}));
