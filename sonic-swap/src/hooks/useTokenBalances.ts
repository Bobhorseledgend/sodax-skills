"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { createPublicClient, http, formatUnits, erc20Abi, zeroAddress } from "viem";
import { sonic } from "viem/chains";
import { rpcConfig } from "@/lib/sodax";
import { SONIC_MAINNET_CHAIN_ID } from "@sodax/types";

const publicClient = createPublicClient({
  chain: sonic,
  transport: http(rpcConfig[SONIC_MAINNET_CHAIN_ID]),
});

interface TokenBalance {
  address: string;
  balance: bigint;
  formatted: string;
}

/**
 * Fetch balances for a list of tokens on Sonic chain.
 * Returns Record<tokenAddress, TokenBalance>.
 * Native S token (zero address) uses getBalance, others use ERC-20 balanceOf.
 */
export function useTokenBalances(
  tokens: Array<{ address: string; decimals: number }> | undefined
) {
  const { address: walletAddress } = useAccount();

  return useQuery({
    queryKey: ["token-balances", walletAddress, tokens?.map(t => t.address).sort().join(",")],
    queryFn: async (): Promise<Record<string, TokenBalance>> => {
      if (!walletAddress || !tokens?.length) return {};

      const balances: Record<string, TokenBalance> = {};

      // Batch: native + ERC-20 balance calls
      const results = await Promise.allSettled(
        tokens.map(async (token) => {
          let balance: bigint;

          if (
            token.address === zeroAddress ||
            token.address === "" ||
            !token.address
          ) {
            // Native S token
            balance = await publicClient.getBalance({
              address: walletAddress as `0x${string}`,
            });
          } else {
            // ERC-20 token
            balance = await publicClient.readContract({
              address: token.address as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [walletAddress as `0x${string}`],
            });
          }

          return {
            address: token.address || zeroAddress,
            balance,
            formatted: formatUnits(balance, token.decimals),
          };
        })
      );

      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          const addr = tokens[i].address || zeroAddress;
          balances[addr.toLowerCase()] = result.value;
        }
      });

      return balances;
    },
    enabled: !!walletAddress && !!tokens?.length,
    staleTime: 10_000, // 10s
    refetchInterval: 15_000, // refetch every 15s
  });
}
