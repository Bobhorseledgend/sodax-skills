"use client";

import { useQuery } from "@tanstack/react-query";
import { getTokenPrice } from "@/services/price";

/**
 * React Query hook for a single token's USD price.
 * Returns null if no coinGeckoId available.
 * Stablecoins return $1 instantly (no API call).
 */
export function useTokenPrice(
  coinGeckoId: string | undefined,
  symbol: string
) {
  return useQuery({
    queryKey: ["token-price", coinGeckoId, symbol],
    queryFn: () => getTokenPrice(coinGeckoId, symbol),
    enabled: !!symbol,
    staleTime: 60_000, // 1 min
    gcTime: 5 * 60_000,
  });
}
