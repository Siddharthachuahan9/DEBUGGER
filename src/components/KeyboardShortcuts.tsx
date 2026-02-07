"use client";

import { useStore } from "@/store";
import { useEffect } from "react";

export function KeyboardShortcuts() {
  const {
    setShowCommandPalette,
    setShowSettings,
    setShowHistory,
    clearWorkspace,
  } = useStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      // Cmd+K — Command Palette
      if (meta && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      // Cmd+, — Settings
      if (meta && e.key === ",") {
        e.preventDefault();
        setShowSettings(true);
      }

      // Cmd+H — History (only when not in input)
      if (meta && e.key === "h" && e.shiftKey) {
        e.preventDefault();
        setShowHistory(true);
      }

      // Cmd+L — Clear workspace
      if (meta && e.key === "l") {
        e.preventDefault();
        clearWorkspace();
      }

      // Escape — Close all modals
      if (e.key === "Escape") {
        setShowCommandPalette(false);
        setShowSettings(false);
        setShowHistory(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setShowCommandPalette, setShowSettings, setShowHistory, clearWorkspace]);

  return null;
}
