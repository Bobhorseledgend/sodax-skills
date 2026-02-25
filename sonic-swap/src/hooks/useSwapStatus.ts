"use client";

import { useEffect, useState, useCallback } from "react";
import { useStatus } from "@sodax/dapp-kit";
import type { Hex } from "viem";

/**
 * SolverIntentStatusCode values:
 *  -1  NOT_FOUND         — Intent not found in solver system
 *   1  NOT_STARTED_YET   — In task pool, not started
 *   2  STARTED_NOT_FINISHED — Currently being processed
 *   3  SOLVED            — Successfully filled
 *   4  FAILED            — Failed to fill
 */

export type SwapStatusLabel =
  | "unknown"
  | "pending"
  | "processing"
  | "filled"
  | "failed"
  | "not_found";

function codeToLabel(code: number): SwapStatusLabel {
  switch (code) {
    case -1:
      return "not_found";
    case 1:
      return "pending";
    case 2:
      return "processing";
    case 3:
      return "filled";
    case 4:
      return "failed";
    default:
      return "unknown";
  }
}

/**
 * Wrapper around useStatus that provides clean status labels
 * and completion detection.
 *
 * useStatus polls automatically every ~3 seconds.
 *
 * @param txHash — The source tx hash where the intent was created (Hex).
 *                 Pass null/undefined to disable polling.
 */
export function useSwapStatus(txHash: string | null | undefined) {
  const [statusLabel, setStatusLabel] = useState<SwapStatusLabel>("unknown");
  const [fillTxHash, setFillTxHash] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // useStatus expects Hex — cast to any since useStatus typing doesn't accept undefined
  // but the hook internally disables polling when no hash is provided
  const hashHex = txHash ? (txHash as Hex) : undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: statusResult, isLoading, error, refetch } = useStatus(
    hashHex as any
  );

  useEffect(() => {
    if (!statusResult) return;

    if (
      typeof statusResult === "object" &&
      "ok" in statusResult
    ) {
      const r = statusResult as { ok: boolean; value?: { status: number; fill_tx_hash?: string }; error?: { detail?: { code?: number; message?: string } } };

      if (r.ok && r.value) {
        const label = codeToLabel(r.value.status);
        setStatusLabel(label);

        if (r.value.fill_tx_hash) {
          setFillTxHash(r.value.fill_tx_hash);
        }

        // Mark complete when filled or failed
        if (label === "filled" || label === "failed") {
          setIsComplete(true);
        }
      } else if (!r.ok && r.error) {
        // Solver returned an error response — treat as failed
        console.warn("[useSwapStatus] Solver error:", r.error);
        setStatusLabel("failed");
        setIsComplete(true);
      }
    }
  }, [statusResult]);

  const manualRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    statusLabel,
    fillTxHash,
    isLoading,
    error,
    isComplete,
    refetch: manualRefresh,
    // Helper flags
    isPending: statusLabel === "pending" || statusLabel === "processing",
    isFilled: statusLabel === "filled",
    isFailed: statusLabel === "failed",
    isNotFound: statusLabel === "not_found",
  };
}
