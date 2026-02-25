"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SodaxProvider } from "@sodax/dapp-kit";
import { SodaxWalletProvider } from "@sodax/wallet-sdk-react";
import { sonic } from "viem/chains";
import { http } from "wagmi";
import { rpcConfig, sodaxConfig } from "@/lib/sodax";

// Privy imports — used when a valid Privy App ID is configured
import { PrivyProvider } from "@privy-io/react-auth";
import {
  createConfig as createPrivyWagmiConfig,
  WagmiProvider as PrivyWagmiProvider,
} from "@privy-io/wagmi";

// Standard wagmi imports — fallback when Privy is not configured
import {
  createConfig as createWagmiConfig,
  WagmiProvider,
} from "wagmi";

import { HAS_PRIVY, PRIVY_APP_ID } from "@/lib/config";

/**
 * Wagmi config — use Privy's version when Privy is available,
 * standard wagmi otherwise. Must match the wrapping provider.
 * Created lazily inside the component to avoid module-scope side effects.
 */
const wagmiConfig = HAS_PRIVY
  ? createPrivyWagmiConfig({
      chains: [sonic],
      transports: { [sonic.id]: http("https://rpc.soniclabs.com") },
      ssr: true,
    })
  : createWagmiConfig({
      chains: [sonic],
      transports: { [sonic.id]: http("https://rpc.soniclabs.com") },
      ssr: true,
    });

/**
 * Provider tree (strict ordering):
 *
 *   [PrivyProvider]        ← only when NEXT_PUBLIC_PRIVY_APP_ID is set
 *     QueryClientProvider  ← React Query for async state
 *       WagmiProvider      ← from @privy-io/wagmi (with Privy) or wagmi (without)
 *         SodaxProvider    ← SODAX SDK context (Sodax instance)
 *           SodaxWalletProvider ← SODAX wallet hooks (useXConnect, etc.)
 *             {children}
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  // QueryClient created per-component-instance to avoid cross-request leaking in SSR
  const [queryClient] = useState(() => new QueryClient());

  const inner = (
    <SodaxProvider rpcConfig={rpcConfig} config={sodaxConfig}>
      <SodaxWalletProvider rpcConfig={rpcConfig}>
        {children}
      </SodaxWalletProvider>
    </SodaxProvider>
  );

  if (HAS_PRIVY) {
    return (
      <PrivyProvider
        appId={PRIVY_APP_ID!}
        config={{
          appearance: { theme: "dark" },
          embeddedWallets: {
            ethereum: { createOnLogin: "users-without-wallets" },
          },
          loginMethods: ["email", "wallet"],
        }}
      >
        <QueryClientProvider client={queryClient}>
          <PrivyWagmiProvider config={wagmiConfig}>
            {inner}
          </PrivyWagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    );
  }

  // No Privy — standard wagmi for injected wallets only
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {inner}
      </WagmiProvider>
    </QueryClientProvider>
  );
}
