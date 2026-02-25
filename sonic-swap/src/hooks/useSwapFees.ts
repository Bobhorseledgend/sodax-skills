"use client";

import { useMemo } from "react";
import { useSodaxContext } from "@sodax/dapp-kit";

/**
 * Calculates solver and partner fees for a given input amount.
 *
 * Uses sodax.swaps.getSolverFee() and sodax.swaps.getPartnerFee()
 * which compute fees based on the SDK config.
 *
 * Solver fee: 0.1% (fixed by protocol)
 * Partner fee: configured in SodaxConfig.swaps.partnerFee (e.g. 1%)
 */
export function useSwapFees(inputAmount: bigint | null) {
  const { sodax } = useSodaxContext();

  const fees = useMemo(() => {
    if (!inputAmount || inputAmount === 0n || !sodax) {
      return { solverFee: null, partnerFee: null, totalFee: null };
    }

    try {
      const solverFee = sodax.swaps.getSolverFee(inputAmount);
      const partnerFee = sodax.swaps.getPartnerFee(inputAmount);
      return {
        solverFee,
        partnerFee,
        totalFee: solverFee + partnerFee,
      };
    } catch {
      return { solverFee: null, partnerFee: null, totalFee: null };
    }
  }, [inputAmount, sodax]);

  return fees;
}
