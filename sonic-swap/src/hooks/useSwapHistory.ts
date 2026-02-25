"use client";

import { useCallback, useState } from "react";

export interface SwapHistoryEntry {
  id: string; // intent hash
  intentHash: string;
  txHash: string; // source chain tx hash (for block explorer + status polling)
  sellSymbol: string;
  buySymbol: string;
  sellAmount: string; // human-readable
  buyAmount: string; // human-readable
  status: "pending" | "filled" | "failed" | "unknown";
  fillTxHash?: string;
  timestamp: number;
}

const STORAGE_KEY = "sodax_swap_history";
const MAX_HISTORY = 20;

function loadHistory(): SwapHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SwapHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(history: SwapHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage may be full — silently fail
  }
}

/**
 * Manages swap history in localStorage.
 * Stores up to MAX_HISTORY recent swaps.
 *
 * Will be upgraded to backend-powered history in Feature 9.
 */
export function useSwapHistory() {
  // Lazy initializer avoids flash of empty state on client
  const [history, setHistory] = useState<SwapHistoryEntry[]>(() => loadHistory());

  const addSwap = useCallback(
    (entry: Omit<SwapHistoryEntry, "timestamp" | "status">) => {
      const newEntry: SwapHistoryEntry = {
        ...entry,
        status: "pending",
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, MAX_HISTORY);
        saveHistory(updated);
        return updated;
      });
    },
    []
  );

  const updateSwapStatus = useCallback(
    (
      id: string,
      status: SwapHistoryEntry["status"],
      fillTxHash?: string
    ) => {
      setHistory((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, status, fillTxHash } : item
        );
        saveHistory(updated);
        return updated;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { history, addSwap, updateSwapStatus, clearHistory };
}
