"use client";

import { useState, useMemo } from "react";
import { useBackendOrderbook } from "@sodax/dapp-kit";
import { truncateAddress, formatTokenAmount } from "@/lib/utils";

interface OrderbookProps {
  /** Callback when user clicks an intent row */
  onSelectIntent?: (intentHash: string) => void;
}

const PAGE_SIZE = 10;

/**
 * Live orderbook showing pending/open intents.
 * Fetches from the backend with pagination.
 */
export function Orderbook({ onSelectIntent }: OrderbookProps) {
  const [page, setPage] = useState(0);

  const pagination = useMemo(
    () => ({
      offset: String(page * PAGE_SIZE),
      limit: String(PAGE_SIZE),
    }),
    [page]
  );

  const { data: orderbook, isLoading, isFetching, error } = useBackendOrderbook({
    pagination,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryOptions: { refetchInterval: 15000 } as any, // auto-refresh every 15s
  });

  const totalPages = orderbook ? Math.ceil(orderbook.total / PAGE_SIZE) : 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Orderbook
        </h3>
        {orderbook && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {orderbook.total} total intents
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="py-6 text-center text-xs text-red-500">
          Failed to load orderbook
        </p>
      )}

      {/* Data */}
      {orderbook && !isLoading && (
        <>
          {orderbook.data.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
              No open intents found.
            </p>
          ) : (
            <div className={`space-y-1.5 transition-opacity ${isFetching && !isLoading ? "pointer-events-none opacity-50" : ""}`}>
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-1 text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <span className="col-span-3">Input</span>
                <span className="col-span-3">Output</span>
                <span className="col-span-2 text-right">Amount</span>
                <span className="col-span-2 text-right">Remaining</span>
                <span className="col-span-2 text-right">Status</span>
              </div>

              {/* Rows */}
              {orderbook.data.map((entry) => {
                const { intentData: intent, intentState: state } = entry;
                const isFilled =
                  !state.exists ||
                  (state.remainingInput === "0" &&
                    state.receivedOutput !== "0");
                const isPartial =
                  state.exists &&
                  state.remainingInput !== "0" &&
                  state.receivedOutput !== "0";

                return (
                  <button
                    key={intent.intentHash}
                    type="button"
                    onClick={() => onSelectIntent?.(intent.intentHash)}
                    className="grid w-full grid-cols-12 gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="col-span-3 truncate font-mono text-zinc-700 dark:text-zinc-300">
                      {truncateAddress(intent.inputToken, 4)}
                    </span>
                    <span className="col-span-3 truncate font-mono text-zinc-700 dark:text-zinc-300">
                      {truncateAddress(intent.outputToken, 4)}
                    </span>
                    <span className="col-span-2 text-right text-zinc-600 dark:text-zinc-400">
                      {formatTokenAmount(intent.inputAmount, 18, 4)}
                    </span>
                    <span className="col-span-2 text-right text-zinc-600 dark:text-zinc-400">
                      {formatTokenAmount(state.remainingInput, 18, 4)}
                    </span>
                    <span className="col-span-2 text-right">
                      <span
                        className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          isFilled
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : isPartial
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : state.pendingPayment
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {isFilled
                          ? "Filled"
                          : isPartial
                            ? "Partial"
                            : state.pendingPayment
                              ? "Pending"
                              : "Open"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:text-zinc-300 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:disabled:text-zinc-600"
              >
                Previous
              </button>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page >= totalPages - 1}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:text-zinc-300 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:disabled:text-zinc-600"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
