"use client";

import { useMemo } from "react";
import { useBackendOrderbook } from "@sodax/dapp-kit";

interface SwapAnalytics {
  totalIntents: number;
  openIntents: number;
  filledIntents: number;
  partialFills: number;
  fillRate: number; // percentage
  totalInputVolume: bigint; // aggregate in wei
  totalOutputVolume: bigint; // aggregate in wei
  topTokenPairs: Array<{
    inputToken: string;
    outputToken: string;
    count: number;
  }>;
}

/**
 * Aggregates swap analytics from the orderbook data.
 * Fetches a larger page of orderbook entries and computes:
 * - Total / open / filled intents
 * - Fill rate percentage
 * - Aggregate volume (input + output)
 * - Top token pairs by frequency
 */
export function useSwapAnalytics() {
  const { data: orderbook, isLoading, error, refetch } = useBackendOrderbook({
    pagination: { offset: "0", limit: "100" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryOptions: { refetchInterval: 30000 } as any, // refresh every 30s
  });

  const analytics = useMemo((): SwapAnalytics | null => {
    if (!orderbook) return null;

    let openIntents = 0;
    let filledIntents = 0;
    let partialFills = 0;
    let totalInputVolume = 0n;
    let totalOutputVolume = 0n;
    const pairCounts = new Map<string, number>();

    for (const entry of orderbook.data) {
      const { intentState: state, intentData: intent } = entry;

      // Accumulate volume
      try {
        totalInputVolume += BigInt(intent.inputAmount);
        totalOutputVolume += BigInt(intent.minOutputAmount);
      } catch {
        // Skip malformed amounts
      }

      // Count by status
      const isFilled =
        !state.exists ||
        (state.remainingInput === "0" && state.receivedOutput !== "0");
      const isPartial =
        state.exists &&
        state.remainingInput !== "0" &&
        state.receivedOutput !== "0";

      if (isFilled) filledIntents++;
      else if (isPartial) partialFills++;
      else openIntents++;

      // Track token pairs
      const pairKey = `${intent.inputToken}-${intent.outputToken}`;
      pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1);
    }

    // Sort pairs by count descending, take top 5
    const topTokenPairs = Array.from(pairCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const [inputToken, outputToken] = key.split("-");
        return { inputToken, outputToken, count };
      });

    const total = orderbook.data.length;
    const fillRate = total > 0 ? (filledIntents / total) * 100 : 0;

    return {
      totalIntents: orderbook.total,
      openIntents,
      filledIntents,
      partialFills,
      fillRate,
      totalInputVolume,
      totalOutputVolume,
      topTokenPairs,
    };
  }, [orderbook]);

  return { analytics, isLoading, error, refetch };
}
