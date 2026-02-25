"use client";

import { useEffect, useRef } from "react";
import { useSwapStatus } from "@/hooks/useSwapStatus";

interface SwapStatusModalProps {
  txHash: string;
  intentHash: string;
  sellSymbol: string;
  buySymbol: string;
  sellAmount: string;
  buyAmount: string;
  onClose: () => void;
  onStatusChange?: (status: string, fillTxHash?: string) => void;
}

/**
 * Status feedback modal shown after a swap is submitted.
 * Polls the solver via useStatus and displays real-time progress.
 *
 * States: pending → processing → filled | failed
 */
export function SwapStatusModal({
  txHash,
  intentHash,
  sellSymbol,
  buySymbol,
  sellAmount,
  buyAmount,
  onClose,
  onStatusChange,
}: SwapStatusModalProps) {
  const {
    statusLabel,
    fillTxHash,
    isPending,
    isFilled,
    isFailed,
    isNotFound,
    isLoading,
    refetch,
  } = useSwapStatus(txHash);

  // Notify parent of status changes for history updates
  // Must be in useEffect (NOT during render) to avoid infinite re-render loops
  const hasNotifiedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!onStatusChange) return;
    if (isFilled && hasNotifiedRef.current !== "filled") {
      hasNotifiedRef.current = "filled";
      onStatusChange("filled", fillTxHash || undefined);
    } else if (isFailed && hasNotifiedRef.current !== "failed") {
      hasNotifiedRef.current = "failed";
      onStatusChange("failed");
    }
  }, [isFilled, isFailed, fillTxHash, onStatusChange]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Swap Status
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Swap summary */}
        <div className="mb-4 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {sellAmount} {sellSymbol} → {buyAmount} {buySymbol}
          </p>
        </div>

        {/* Status display */}
        <div className="mb-4 flex flex-col items-center gap-3 py-4">
          {/* Pending / Processing */}
          {isPending && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg
                  className="h-6 w-6 animate-spin text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {statusLabel === "processing"
                  ? "Solver is executing..."
                  : "Waiting for solver..."}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                This usually takes a few seconds
              </p>
            </>
          )}

          {/* Filled / Success */}
          {isFilled && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Swap complete!
              </p>
              {fillTxHash && (
                <a
                  href={`https://sonicscan.org/tx/${fillTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 underline hover:text-green-500 dark:text-green-400"
                >
                  View fill transaction
                </a>
              )}
            </>
          )}

          {/* Failed */}
          {isFailed && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg
                  className="h-6 w-6 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Swap failed
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                The solver was unable to fill your swap.
              </p>
            </>
          )}

          {/* Not found */}
          {isNotFound && !isLoading && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <svg
                  className="h-6 w-6 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Intent not found
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                The solver hasn&apos;t picked up this intent yet. It may still
                be propagating.
              </p>
            </>
          )}

          {/* Loading initial state */}
          {isLoading && statusLabel === "unknown" && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <svg
                  className="h-6 w-6 animate-spin text-zinc-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Checking status...
              </p>
            </>
          )}
        </div>

        {/* Explorer link for source tx */}
        <div className="mb-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <a
            href={`https://sonicscan.org/tx/${txHash || intentHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            View intent transaction on SonicScan
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isPending && (
            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              isFilled
                ? "flex-1 bg-green-500 text-white hover:bg-green-600"
                : isFailed
                  ? "flex-1 bg-red-500 text-white hover:bg-red-600"
                  : "flex-1 bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isFilled ? "Done" : isFailed ? "Close" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
