"use client";

import { useState } from "react";
import { formatTokenAmount } from "@/lib/utils";

interface SwapDetailsProps {
  sellSymbol: string;
  buySymbol: string;
  exchangeRate: string | null;
  minReceived: bigint | null;
  buyDecimals: number;
  slippage: number; // basis points
  priceImpact: number | null; // percentage
}

/**
 * Expandable swap details panel showing:
 * - Exchange rate
 * - Minimum received (after slippage)
 * - Slippage tolerance
 * - Price impact
 */
export function SwapDetails({
  sellSymbol,
  buySymbol,
  exchangeRate,
  minReceived,
  buyDecimals,
  slippage,
  priceImpact,
}: SwapDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!exchangeRate) return null;

  const priceImpactColor =
    priceImpact === null
      ? "text-zinc-500 dark:text-zinc-400"
      : priceImpact > 5
        ? "text-red-500"
        : priceImpact > 2
          ? "text-orange-500"
          : "text-green-500";

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/30"
      >
        <span>{exchangeRate}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Expandable details */}
      {isExpanded && (
        <div className="space-y-2 border-t border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
          {/* Minimum received */}
          {minReceived !== null && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Min. received
              </span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {formatTokenAmount(minReceived, buyDecimals)} {buySymbol}
              </span>
            </div>
          )}

          {/* Slippage tolerance */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Slippage tolerance
            </span>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {(slippage / 100).toFixed(1)}%
            </span>
          </div>

          {/* Price impact */}
          {priceImpact !== null && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Price impact
              </span>
              <span className={`text-xs font-medium ${priceImpactColor}`}>
                {priceImpact < 0.01 ? "<0.01" : priceImpact.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Route */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Route
            </span>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {sellSymbol} → {buySymbol} (Sonic)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
