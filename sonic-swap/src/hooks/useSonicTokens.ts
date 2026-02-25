"use client";

import { useQuery } from "@tanstack/react-query";
import { useSodaxContext } from "@sodax/dapp-kit";
import { SONIC_MAINNET_CHAIN_ID } from "@sodax/types";

/**
 * Load all swap tokens available on Sonic chain.
 * Calls sodax.initialize() to fetch latest config, then returns
 * the token list for Sonic from ConfigService.
 */
export function useSonicTokens() {
  const { sodax } = useSodaxContext();

  return useQuery({
    queryKey: ["sonic-tokens"],
    queryFn: async () => {
      await sodax.initialize();
      const allTokens = sodax.config.getSwapTokens();
      const sonicTokens = allTokens[SONIC_MAINNET_CHAIN_ID] ?? [];
      return sonicTokens;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000,
  });
}
