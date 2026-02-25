"use client";

import dynamic from "next/dynamic";

/**
 * Dynamic import with ssr: false — prevents the entire provider tree
 * from rendering during SSR/static generation.
 *
 * Required because:
 * 1. SODAX wallet-sdk-react accesses `window` for wallet detection
 * 2. Privy validates its app ID during initialization
 * 3. wagmi connectors assume browser environment
 */
const AppProviders = dynamic(
  () =>
    import("@/providers/AppProviders").then((mod) => ({
      default: mod.AppProviders,
    })),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
