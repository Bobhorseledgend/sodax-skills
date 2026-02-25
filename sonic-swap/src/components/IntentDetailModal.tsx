"use client";

import { useIntentRelay } from "@/hooks/useIntentRelay";
import { truncateAddress, formatTokenAmount } from "@/lib/utils";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface IntentDetailModalProps {
  intentHash: string;
  onClose: () => void;
}

/**
 * Modal showing detailed information about a specific intent.
 * Uses useIntentRelay which fetches intent data and derives relay status.
 * Single fetch — no duplicate network requests.
 */
export function IntentDetailModal({
  intentHash,
  onClose,
}: IntentDetailModalProps) {
  // Single fetch via useIntentRelay (which calls useBackendIntentByHash internally)
  const { intentData, steps, relayStatus, isLoading, error } =
    useIntentRelay(intentHash);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Intent Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
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

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
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
        )}

        {/* Error (only show if no cached data) */}
        {error && !intentData && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-500">
              Failed to load intent: {error.message}
            </p>
          </div>
        )}

        {/* Intent data */}
        {intentData && !isLoading && (
          <div className="space-y-4">
            {/* Intent hash */}
            <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
              <p className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Intent Hash
              </p>
              <p className="break-all font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {intentHash}
              </p>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Status
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  relayStatus === "executed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : relayStatus === "failed"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : relayStatus === "pending" || relayStatus === "executing"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {intentData.open ? "Open" : "Closed"} —{" "}
                {relayStatus.charAt(0).toUpperCase() + relayStatus.slice(1)}
              </span>
            </div>

            {/* Tokens & amounts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Input
                </p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatTokenAmount(intentData.intent.inputAmount, 18)}
                </p>
                <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                  {truncateAddress(intentData.intent.inputToken, 6)}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Min Output
                </p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatTokenAmount(intentData.intent.minOutputAmount, 18)}
                </p>
                <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                  {truncateAddress(intentData.intent.outputToken, 6)}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="space-y-1.5">
              <DetailRow
                label="Creator"
                value={truncateAddress(intentData.intent.creator, 6)}
              />
              <DetailRow
                label="Solver"
                value={
                  intentData.intent.solver === ZERO_ADDRESS
                    ? "None (default)"
                    : truncateAddress(intentData.intent.solver, 6)
                }
              />
              <DetailRow
                label="Source Chain"
                value={String(intentData.intent.srcChain)}
              />
              <DetailRow
                label="Dest Chain"
                value={String(intentData.intent.dstChain)}
              />
              <DetailRow
                label="Block"
                value={String(intentData.blockNumber)}
              />
              <DetailRow
                label="Deadline"
                value={new Date(
                  Number(intentData.intent.deadline) * 1000
                ).toLocaleString()}
              />
              <DetailRow
                label="Partial Fill"
                value={intentData.intent.allowPartialFill ? "Yes" : "No"}
              />
            </div>

            {/* Relay flow */}
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Relay Flow
              </p>
              <div className="space-y-1">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        step.status === "done"
                          ? "bg-green-500 text-white"
                          : step.status === "active"
                            ? "bg-blue-500 text-white"
                            : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
                      }`}
                    >
                      {step.status === "done" ? "✓" : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium ${
                          step.status === "pending"
                            ? "text-zinc-400 dark:text-zinc-500"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tx link (links to intent creation tx) */}
            <a
              href={`https://sonicscan.org/tx/${intentData.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-blue-500 underline hover:text-blue-600"
            >
              View on SonicScan
            </a>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-zinc-100 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400 dark:text-zinc-500">{label}</span>
      <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
        {value}
      </span>
    </div>
  );
}
