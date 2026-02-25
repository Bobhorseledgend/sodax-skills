"use client";

import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useBackendUserIntents } from "@sodax/dapp-kit";
import { Header } from "@/components/Header";
import { Orderbook } from "@/components/Orderbook";
import { IntentDetailModal } from "@/components/IntentDetailModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { truncateAddress, formatTokenAmount } from "@/lib/utils";

type Tab = "history" | "orderbook";

/**
 * Activity page showing:
 * - User's swap/intent history (from backend)
 * - Live orderbook
 * - Intent detail modal on row click
 */
export default function ActivityPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  // Fetch user intents from backend
  // params is optional — omit entirely when no wallet to disable the query
  const userIntentsParams = useMemo(
    () =>
      address
        ? { params: { userAddress: address as `0x${string}` } }
        : {},
    [address]
  );

  const {
    data: userIntents,
    isLoading: intentsLoading,
    error: intentsError,
    refetch: refetchIntents,
  } = useBackendUserIntents(userIntentsParams);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-[560px] flex-col gap-4 px-4 py-8">
        <Header />

        <ErrorBoundary>
          {/* Tab toggle */}
          <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            >
              My Activity
            </TabButton>
            <TabButton
              active={activeTab === "orderbook"}
              onClick={() => setActiveTab("orderbook")}
            >
              Orderbook
            </TabButton>
          </div>

          {/* Tab content */}
          {activeTab === "history" && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Swap History
                </h2>
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => refetchIntents()}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Refresh
                  </button>
                )}
              </div>

              {!isConnected ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    Connect your wallet to view your swap history
                  </p>
                </div>
              ) : intentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
                    />
                  ))}
                </div>
              ) : intentsError ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-red-500">
                    Failed to load history
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchIntents()}
                    className="mt-2 text-xs text-blue-500 hover:text-blue-600"
                  >
                    Try again
                  </button>
                </div>
              ) : userIntents && userIntents.items.length > 0 ? (
                <div className="space-y-1.5">
                  {userIntents.items.map((intent) => (
                    <button
                      key={intent.intentHash}
                      type="button"
                      onClick={() => setSelectedIntent(intent.intentHash)}
                      className="flex w-full items-center justify-between rounded-lg bg-zinc-50 px-3 py-3 text-left transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                            {formatTokenAmount(
                              intent.intent.inputAmount,
                              18,
                              4
                            )}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                            {truncateAddress(intent.intent.inputToken, 4)}
                          </span>
                          <span className="text-xs text-zinc-400">→</span>
                          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                            {formatTokenAmount(
                              intent.intent.minOutputAmount,
                              18,
                              4
                            )}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                            {truncateAddress(intent.intent.outputToken, 4)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                            {truncateAddress(intent.intentHash, 6)}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            Block {intent.blockNumber}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          intent.open
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {intent.open ? "Open" : "Filled"}
                      </span>
                    </button>
                  ))}

                  {/* Total count */}
                  <p className="pt-2 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
                    Showing {userIntents.items.length} of {userIntents.total}{" "}
                    intents
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    No swap history found for this wallet.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "orderbook" && (
            <Orderbook
              onSelectIntent={(hash) => setSelectedIntent(hash)}
            />
          )}
        </ErrorBoundary>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Powered by SODAX — Sonic chain
        </p>

        {/* Intent detail modal */}
        {selectedIntent && (
          <IntentDetailModal
            intentHash={selectedIntent}
            onClose={() => setSelectedIntent(null)}
          />
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors ${
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
          : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}
