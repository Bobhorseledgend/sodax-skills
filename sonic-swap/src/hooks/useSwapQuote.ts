"use client";

import { useState, useEffect } from "react";
import { useQuote } from "@sodax/dapp-kit";
import { SONIC_MAINNET_CHAIN_ID } from "@sodax/types";

interface QuoteParams {
  sellTokenAddress: string;
  buyTokenAddress: string;
  amount: bigint;
  enabled: boolean;
}

/**
 * Debounced swap quote hook.
 * Waits 300ms after last input change before fetching.
 */
export function useSwapQuote({
  sellTokenAddress,
  buyTokenAddress,
  amount,
  enabled,
}: QuoteParams) {
  const [debouncedAmount, setDebouncedAmount] = useState<bigint>(0n);

  // Debounce amount changes by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 300);
    return () => clearTimeout(timer);
  }, [amount]);

  const quoteEnabled =
    enabled &&
    !!sellTokenAddress &&
    !!buyTokenAddress &&
    debouncedAmount > 0n;

  const quoteResult = useQuote(
    quoteEnabled
      ? {
          token_src: sellTokenAddress,
          token_src_blockchain_id: SONIC_MAINNET_CHAIN_ID,
          token_dst: buyTokenAddress,
          token_dst_blockchain_id: SONIC_MAINNET_CHAIN_ID,
          amount: debouncedAmount,
          quote_type: "exact_input" as const,
        }
      : undefined
  );

  return {
    ...quoteResult,
    isDebouncing: amount !== debouncedAmount,
  };
}
