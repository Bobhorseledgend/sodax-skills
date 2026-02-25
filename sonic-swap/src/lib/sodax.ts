import type { SodaxConfig, PartnerFee } from "@sodax/sdk";
import { SONIC_MAINNET_CHAIN_ID } from "@sodax/types";
import type { RpcConfig } from "@sodax/types";

/**
 * RPC configuration — all EVM chains required by SodaxWalletProvider.
 *
 * SodaxWalletProvider internally calls createWagmiConfig(rpcConfig) which
 * creates wagmi transports for ALL 12 EVM chains. Every chain must have
 * a valid URL or http() will throw "Endpoint URL must start with http/https".
 *
 * We only swap on Sonic, but the other RPCs are needed for wagmi config init.
 * Free public RPCs are fine for chains we don't actively transact on.
 */
export const rpcConfig: RpcConfig = {
  // ─── Primary (Sonic hub) ───────────────────────────────────────
  [SONIC_MAINNET_CHAIN_ID]: "https://rpc.soniclabs.com",

  // ─── Spoke chains (public RPCs for wagmi config) ──────────────
  ethereum: "https://eth.llamarpc.com",
  "0xa86a.avax": "https://api.avax.network/ext/bc/C/rpc",
  "0xa4b1.arbitrum": "https://arb1.arbitrum.io/rpc",
  "0x2105.base": "https://mainnet.base.org",
  "0x38.bsc": "https://bsc-dataseed.bnbchain.org",
  "0xa.optimism": "https://mainnet.optimism.io",
  "0x89.polygon": "https://polygon-rpc.com",
  hyper: "https://rpc.hyperliquid.xyz/evm",
  lightlink: "https://replicator.phoenix.lightlink.io/rpc/v1",
  "0x2019.kaia": "https://public-en.node.kaia.io",
  redbelly: "https://governors.testnet.redbelly.network",

  // ─── Non-EVM (optional, prevents missing key warnings) ────────
  solana: "https://api.mainnet-beta.solana.com",
};

/**
 * Partner fee configuration.
 * 100 basis points = 1% fee on all swaps.
 * Set NEXT_PUBLIC_PARTNER_FEE_ADDRESS in .env.local to your Sonic wallet address.
 * WARNING: The zero address is the burn address — fees sent there are unrecoverable.
 */
const PARTNER_ADDRESS =
  process.env.NEXT_PUBLIC_PARTNER_FEE_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

if (
  PARTNER_ADDRESS === "0x0000000000000000000000000000000000000000" &&
  typeof window !== "undefined"
) {
  console.warn(
    "[sodax] Partner fee address is the zero address. " +
      "Set NEXT_PUBLIC_PARTNER_FEE_ADDRESS in .env.local to collect fees."
  );
}

export const partnerFee: PartnerFee = {
  address: PARTNER_ADDRESS as `0x${string}`,
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
