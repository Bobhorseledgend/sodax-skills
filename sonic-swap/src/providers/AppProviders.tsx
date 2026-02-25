"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { SodaxProvider } from "@sodax/dapp-kit";
import { SodaxWalletProvider } from "@sodax/wallet-sdk-react";
import { sonic } from "viem/chains";
import { http } from "wagmi";
import { rpcConfig, sodaxConfig } from "@/lib/sodax";

/**
 * Wagmi config via @privy-io/wagmi — NOT from wagmi directly.
 * This ensures Privy embedded wallets (email sign-in) flow into wagmi.
 */
const wagmiConfig = createConfig({
  chains: [sonic],
  transports: {
    [sonic.id]: http("https://rpc.soniclabs.com"),
  },
  ssr: true,
});

const queryClient = new QueryClient();

/**
 * Provider tree (strict ordering):
 *
 *   PrivyProvider           ← email sign-in, embedded wallets
 *     QueryClientProvider   ← React Query for async state
 *       WagmiProvider       ← from @privy-io/wagmi (not wagmi!)
 *         SodaxProvider     ← SODAX SDK context (Sodax instance)
 *           SodaxWalletProvider ← SODAX wallet hooks (useXConnect, etc.)
 *             {children}
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "placeholder-app-id"}
      config={{
        appearance: {
          theme: "dark",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        loginMethods: ["email", "wallet"],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <SodaxProvider rpcConfig={rpcConfig} config={sodaxConfig}>
            <SodaxWalletProvider rpcConfig={rpcConfig}>
              {children}
            </SodaxWalletProvider>
          </SodaxProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
