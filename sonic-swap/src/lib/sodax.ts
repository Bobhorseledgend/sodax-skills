import type { SodaxConfig, PartnerFee } from "@sodax/sdk";
import { SONIC_MAINNET_CHAIN_ID } from "@sodax/types";
import type { RpcConfig } from "@sodax/types";

/**
 * RPC configuration — Sonic chain only.
 * The SDK uses this to connect to the Sonic hub chain.
 */
export const rpcConfig: RpcConfig = {
  [SONIC_MAINNET_CHAIN_ID]: "https://rpc.soniclabs.com",
};

/**
 * Partner fee configuration.
 * 100 basis points = 1% fee on all swaps.
 * Replace address with your actual Sonic hub wallet address.
 */
export const partnerFee: PartnerFee = {
  address: "0x0000000000000000000000000000000000000000", // TODO: Replace with actual partner address
  percentage: 100, // 1%
};

/**
 * SDK configuration — swap-only, Sonic mainnet.
 * Partner fee is wired globally so every swap includes it.
 */
export const sodaxConfig: SodaxConfig = {
  swaps: {
    partnerFee,
  },
};
