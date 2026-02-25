/**
 * App-specific type definitions for the Sonic Swap site.
 * SDK types are re-exported from @sodax/sdk and @sodax/types.
 */

export type SwapDirection = "sell" | "buy";

export interface SwapHistoryEntry {
  intentHash: string;
  sellToken: {
    symbol: string;
    address: string;
    decimals: number;
  };
  buyToken: {
    symbol: string;
    address: string;
    decimals: number;
  };
  sellAmount: string;
  buyAmount: string;
  status: "pending" | "filled" | "cancelled" | "expired";
  timestamp: number;
}
