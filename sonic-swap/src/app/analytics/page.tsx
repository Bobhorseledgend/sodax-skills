"use client";

import { Header } from "@/components/Header";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSwapAnalytics } from "@/hooks/useSwapAnalytics";
import { formatWei, formatCompact, formatPercent } from "@/lib/formatters";
import { truncateAddress } from "@/lib/utils";

/**
 * Analytics dashboard page.
 * Shows aggregated swap metrics from the orderbook:
 * - Total intents, fill rate, volume
 * - Top token pairs
 */
export default function AnalyticsPage() {
  const { analytics, isLoading, error, refetch } = useSwapAnalytics();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-[560px] flex-col gap-4 px-4 py-8">
        <Header />

        <ErrorBoundary>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Swap Analytics
            </h2>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs text-blue-500 hover:text-blue-600"
            >
              Refresh
            </button>
          </div>

          {/* Loading (only on initial load, not on refetch) */}
          {isLoading && !analytics && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          )}

          {/* Error (only if no cached data available) */}
          {error && !analytics && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load analytics data
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs text-blue-500 hover:text-blue-600"
              >
                Try again
              </button>
            </div>
          )}

          {/* Analytics cards (stay visible during refetch) */}
          {analytics && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AnalyticsCard
                  label="Total Intents"
                  value={formatCompact(analytics.totalIntents)}
                  subValue="Across all pairs"
                  icon={
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                />

                <AnalyticsCard
                  label="Fill Rate"
                  value={formatPercent(analytics.fillRate)}
                  subValue={`${analytics.filledIntents} of ${analytics.filledIntents + analytics.openIntents + analytics.partialFills} sampled`}
                  trend={
                    analytics.fillRate > 80
                      ? "up"
                      : analytics.fillRate > 50
                        ? "neutral"
                        : "down"
                  }
                  icon={
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
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  }
                />

                <AnalyticsCard
                  label="Open Intents"
                  value={formatCompact(analytics.openIntents)}
                  subValue={
                    analytics.partialFills > 0
                      ? `${analytics.partialFills} partial`
                      : "Awaiting fill"
                  }
                  icon={
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
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  }
                />

                <AnalyticsCard
                  label="Input Volume"
                  value={formatWei(analytics.totalInputVolume, 18, 2)}
                  subValue="Total input (wei)"
                  icon={
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
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  }
                />
              </div>

              {/* Top Token Pairs */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Top Token Pairs
                </h3>
                {analytics.topTokenPairs.length === 0 ? (
                  <p className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    No swap data available yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topTokenPairs.map((pair, i) => {
                      const maxCount = analytics.topTokenPairs[0]?.count || 1;
                      const barWidth = Math.max(
                        5,
                        (pair.count / maxCount) * 100
                      );

                      return (
                        <div key={`${pair.inputToken}-${pair.outputToken}`}>
                          <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                {i + 1}
                              </span>
                              <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                {truncateAddress(pair.inputToken, 4)} →{" "}
                                {truncateAddress(pair.outputToken, 4)}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              {pair.count} swaps
                            </span>
                          </div>
                          {/* Bar */}
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status breakdown */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Intent Status Breakdown
                </h3>
                <div className="flex items-center gap-2">
                  {/* Stacked bar */}
                  <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {analytics.totalIntents > 0 && (
                      <>
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${(analytics.filledIntents / Math.max(analytics.filledIntents + analytics.openIntents + analytics.partialFills, 1)) * 100}%`,
                          }}
                          title={`Filled: ${analytics.filledIntents}`}
                        />
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{
                            width: `${(analytics.partialFills / Math.max(analytics.filledIntents + analytics.openIntents + analytics.partialFills, 1)) * 100}%`,
                          }}
                          title={`Partial: ${analytics.partialFills}`}
                        />
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${(analytics.openIntents / Math.max(analytics.filledIntents + analytics.openIntents + analytics.partialFills, 1)) * 100}%`,
                          }}
                          title={`Open: ${analytics.openIntents}`}
                        />
                      </>
                    )}
                  </div>
                </div>
                {/* Legend */}
                <div className="mt-2 flex items-center gap-4">
                  <LegendItem
                    color="bg-green-500"
                    label="Filled"
                    count={analytics.filledIntents}
                  />
                  <LegendItem
                    color="bg-amber-500"
                    label="Partial"
                    count={analytics.partialFills}
                  />
                  <LegendItem
                    color="bg-blue-500"
                    label="Open"
                    count={analytics.openIntents}
                  />
                </div>
              </div>
            </>
          )}
        </ErrorBoundary>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Powered by SODAX — Sonic chain
        </p>
      </main>
    </div>
  );
}

function LegendItem({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
        {label} ({count})
      </span>
    </div>
  );
}
