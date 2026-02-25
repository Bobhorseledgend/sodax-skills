"use client";

import { useCallback, useState } from "react";
import { useSwap, useSwapApprove, useSpokeProvider } from "@sodax/dapp-kit";
import { SONIC_MAINNET_CHAIN_ID } from "@sodax/types";
import type { CreateIntentParams } from "@sodax/sdk";

export type SwapStage =
  | "idle"
  | "approving"
  | "swapping"
  | "success"
  | "error";

/**
 * Manages the full swap execution flow: approve → swap.
 *
 * Hook signatures (from dapp-kit types):
 *   useSpokeProvider(chainId) → SpokeProvider | undefined
 *   useSwapApprove(params, spokeProvider) → { approve, isLoading, error, resetError }
 *   useSwap(spokeProvider) → UseMutationResult<CreateIntentResult, Error, CreateIntentParams>
 *
 * @param intentParams - The CreateIntentParams to use for approval check and swap.
 *                       Pass undefined when params aren't ready yet.
 */
export function useSwapExecution(
  intentParams: CreateIntentParams | undefined
) {
  const [stage, setStage] = useState<SwapStage>("idle");
  const [intentHash, setIntentHash] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // useSpokeProvider returns SpokeProvider | undefined (NOT { data: ... })
  const spokeProvider = useSpokeProvider(SONIC_MAINNET_CHAIN_ID);

  // useSwapApprove checks allowance reactively and provides approve()
  const { approve, isLoading: isApproving } = useSwapApprove(
    intentParams,
    spokeProvider
  );

  // useSwap(spokeProvider) returns UseMutationResult
  const { mutateAsync: swap, isPending: isSwapping } = useSwap(spokeProvider);

  const execute = useCallback(async () => {
    if (!intentParams || !spokeProvider) return;

    setError(null);
    setIntentHash(null);
    setTxHash(null);

    try {
      // Step 1: Approve (skips automatically if already approved or native token)
      setStage("approving");
      const approved = await approve({ params: intentParams });
      if (!approved) {
        throw new Error("Token approval failed or was rejected");
      }

      // Step 2: Execute swap
      setStage("swapping");
      const result = await swap(intentParams);

      // Result type: Result<[SolverExecutionResponse, Intent, IntentDeliveryInfo], IntentError>
      if (result && typeof result === "object" && "ok" in result) {
        const r = result as {
          ok: boolean;
          value?: [
            { intent_hash?: string },
            unknown,
            { srcTxHash?: string }
          ];
          error?: unknown;
        };
        if (r.ok && r.value) {
          // SolverExecutionResponse uses intent_hash (snake_case)
          const hash =
            r.value[0]?.intent_hash || String(r.value[0] || "");
          // IntentDeliveryInfo has the on-chain tx hash for block explorer
          const onChainTxHash = r.value[2]?.srcTxHash || hash;
          setIntentHash(hash);
          setTxHash(onChainTxHash);
          setStage("success");
          return hash;
        } else {
          throw new Error(
            r.error ? String(r.error) : "Swap failed"
          );
        }
      }

      setStage("success");
      return null;
    } catch (err: unknown) {
      setStage("error");
      const message =
        err instanceof Error
          ? err.message
          : "Swap failed — please try again";
      setError(message);
      throw err;
    }
  }, [intentParams, spokeProvider, approve, swap]);

  const reset = useCallback(() => {
    setStage("idle");
    setIntentHash(null);
    setTxHash(null);
    setError(null);
  }, []);

  return {
    execute,
    reset,
    stage,
    intentHash,
    txHash,
    error,
    isApproving,
    isSwapping,
    spokeProvider,
  };
}
