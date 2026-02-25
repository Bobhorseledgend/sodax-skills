"use client";

import type { SwapHistoryEntry } from "@/hooks/useSwapHistory";

interface SwapHistoryProps {
  history: SwapHistoryEntry[];
  onClear: () => void;
}

function StatusBadge({ status }: { status: SwapHistoryEntry["status"] }) {
  const styles = {
    pending:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    filled:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    unknown:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };

  const labels = {
    pending: "Pending",
    filled: "Filled",
    failed: "Failed",
    unknown: "Unknown",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Displays recent swap history from localStorage.
 * Will be upgraded to backend-powered history in Feature 9.
 */
export function SwapHistory({ history, onClear }: SwapHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Recent Swaps
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-zinc-400 transition-colors hover:text-red-500 dark:text-zinc-500"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {history.slice(0, 5).map((entry) => (
          <a
            key={entry.id}
            href={`https://sonicscan.org/tx/${entry.fillTxHash || entry.txHash || entry.intentHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {entry.sellAmount} {entry.sellSymbol} → {entry.buyAmount}{" "}
                {entry.buySymbol}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {timeAgo(entry.timestamp)}
              </span>
            </div>
            <StatusBadge status={entry.status} />
          </a>
        ))}
      </div>
    </div>
  );
}
