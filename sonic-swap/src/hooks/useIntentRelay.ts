"use client";

import { useMemo } from "react";
import { useBackendIntentByHash } from "@sodax/dapp-kit";

/**
 * Relay packet status flow for an intent:
 *   pending → validating → executing → executed
 *
 * We derive this from the intent's `open` field and `events` array
 * from the backend response.
 */
export type RelayStatus =
  | "unknown"
  | "pending"
  | "validating"
  | "executing"
  | "executed"
  | "failed";

export interface RelayStep {
  label: string;
  status: "done" | "active" | "pending";
  description: string;
}

/**
 * Tracks the relay packet status for a given intent hash.
 * Combines backend intent data with solver status to show the
 * full execution flow: User Tx → Relay → Hub (Sonic) → Execute → Result
 */
export function useIntentRelay(intentHash: string | null | undefined) {
  const { data: intentData, isLoading, error, refetch } = useBackendIntentByHash(
    intentHash
      ? {
          params: { intentHash },
          // SDK types require queryKey in UseQueryOptions but the hook sets it internally
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          queryOptions: { refetchInterval: 4000 } as any, // poll while open
        }
      : undefined
  );

  // Derive relay status from intent data
  const relayStatus = useMemo((): RelayStatus => {
    if (!intentData) return "unknown";

    // If the intent has events, it's been processed
    const hasEvents = intentData.events && intentData.events.length > 0;

    if (!intentData.open && hasEvents) {
      return "executed";
    }

    if (!intentData.open && !hasEvents) {
      // Closed without events = failed/cancelled
      return "failed";
    }

    if (intentData.open && hasEvents) {
      // Open with some events = in progress
      return "executing";
    }

    // Open, no events = still pending
    return "pending";
  }, [intentData]);

  // Build the step-by-step relay flow
  const steps = useMemo((): RelayStep[] => {
    const getStepStatus = (
      stepOrder: number,
      currentStep: number
    ): "done" | "active" | "pending" => {
      if (stepOrder < currentStep) return "done";
      if (stepOrder === currentStep) return "active";
      return "pending";
    };

    // Map relay status to a step number
    const currentStep =
      relayStatus === "executed"
        ? 4
        : relayStatus === "executing"
          ? 3
          : relayStatus === "validating"
            ? 2
            : relayStatus === "pending"
              ? 1
              : relayStatus === "failed"
                ? -1
                : 0;

    if (relayStatus === "failed") {
      return [
        { label: "Intent Created", status: "done", description: "Intent submitted to spoke chain" },
        { label: "Relay", status: "done", description: "Relayed to hub chain" },
        { label: "Failed", status: "active", description: "Solver could not fill this intent" },
      ];
    }

    return [
      {
        label: "Intent Created",
        status: getStepStatus(1, currentStep),
        description: "Intent submitted to spoke chain",
      },
      {
        label: "Relay",
        status: getStepStatus(2, currentStep),
        description: "Relayed to hub chain (Sonic)",
      },
      {
        label: "Executing",
        status: getStepStatus(3, currentStep),
        description: "Solver filling the intent",
      },
      {
        label: "Complete",
        status: getStepStatus(4, currentStep),
        description: "Tokens delivered to destination",
      },
    ];
  }, [relayStatus]);

  return {
    intentData,
    relayStatus,
    steps,
    isLoading,
    error,
    refetch,
    isComplete: relayStatus === "executed" || relayStatus === "failed",
  };
}
