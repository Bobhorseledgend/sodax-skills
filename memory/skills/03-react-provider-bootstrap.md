# Skill 3: React Provider Bootstrap

## Quick Reference

```
npm install @sodax/sdk @sodax/dapp-kit @sodax/wallet-sdk-react @sodax/types
npm install @tanstack/react-query wagmi viem @rainbow-me/rainbowkit
```

**Package:** `packages/dapp-kit` (v0.0.1-rc.4) — `SodaxProvider`

---

## Provider Architecture

```
<QueryClientProvider>           — @tanstack/react-query
  <WagmiProvider>               — wagmi (EVM wallets)
    <RainbowKitProvider>        — UI for EVM wallet selection (optional)
      <SuiProviders>            — @mysten/dapp-kit (Sui wallets)
        <SolanaProviders>       — @solana/wallet-adapter (Solana wallets)
          <SodaxProvider>       — @sodax/dapp-kit (SDK instance + context)
            <SodaxWalletProvider> — @sodax/wallet-sdk-react (multi-chain state)
              <App />
```

## SodaxProvider (from @sodax/dapp-kit)

```typescript
import { SodaxProvider } from '@sodax/dapp-kit';
import type { SodaxConfig } from '@sodax/sdk';
import type { RpcConfig } from '@sodax/types';

// Props:
interface SodaxProviderProps {
  children: ReactNode;
  testnet?: boolean;          // default false
  config?: SodaxConfig;       // see Skill 1 for options
  rpcConfig: RpcConfig;       // RPC URLs per chain
}

// Usage:
<SodaxProvider
  config={{ swap: { partnerFee: { address: '0x...', percentage: 100 } } }}
  rpcConfig={{
    'sonic': 'https://rpc.soniclabs.com',
    '0xa4b1.arbitrum': 'https://arb1.arbitrum.io/rpc',
    '0xa86a.avax': 'https://api.avax.network/ext/bc/C/rpc',
    // ... add RPCs for all chains you support
  }}
>
  {children}
</SodaxProvider>
```

## Context Access

```typescript
import { useSodaxContext } from '@sodax/dapp-kit';

function MyComponent() {
  const { sodax, testnet, rpcConfig } = useSodaxContext();
  // sodax: Sodax instance — access .swaps, .moneyMarket, .bridge, etc.
  // testnet: boolean
  // rpcConfig: RpcConfig
}
```

## Dapp-Kit Hooks (60+ hooks via @sodax/dapp-kit)

All hooks require `<SodaxProvider>` ancestor. Organized by feature:

### Swap Hooks
```typescript
import { useQuote, useSwap, useSwapAllowance, useSwapApprove, useStatus, useCancelSwap, useCreateLimitOrder, useCancelLimitOrder } from '@sodax/dapp-kit';
```

### Bridge Hooks
```typescript
import { useBridge, useBridgeAllowance, useBridgeApprove, useGetBridgeableTokens, useGetBridgeableAmount } from '@sodax/dapp-kit';
```

### Money Market Hooks
```typescript
import { useSupply, useBorrow, useWithdraw, useRepay, useMMAllowance, useMMApprove, useReservesData, useUserReservesData, useReservesUsdFormat, useAToken, useATokensBalances, useUserFormattedSummary } from '@sodax/dapp-kit';
```

### Staking Hooks
```typescript
import { useStake, useUnstake, useInstantUnstake, useClaim, useCancelUnstake, useStakeAllowance, useStakeApprove, useUnstakeAllowance, useUnstakeApprove, useInstantUnstakeAllowance, useInstantUnstakeApprove, useStakingInfo, useUnstakingInfo, useUnstakingInfoWithPenalty, useStakingConfig, useStakeRatio, useInstantUnstakeRatio, useConvertedAssets } from '@sodax/dapp-kit';
```

### Backend Query Hooks
```typescript
import { useBackendOrderbook, useBackendUserIntents, useBackendIntentByHash, useBackendIntentByTxHash, useBackendAllMoneyMarketAssets, useBackendMoneyMarketAsset, useBackendMoneyMarketPosition, useBackendMoneyMarketAssetBorrowers, useBackendMoneyMarketAssetSuppliers } from '@sodax/dapp-kit';
```

### Shared / Provider Hooks
```typescript
import { useSodaxContext, useHubProvider, useSpokeProvider, useDeriveUserWalletAddress, useGetUserHubWalletAddress, useEstimateGas, useRequestTrustline, useStellarTrustlineCheck } from '@sodax/dapp-kit';
```

### Migration Hooks
```typescript
import { useMigrate, useMigrationAllowance, useMigrationApprove } from '@sodax/dapp-kit';
```

## Complete Bootstrap Example (Next.js)

```typescript
// providers/AppProviders.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { SodaxProvider } from '@sodax/dapp-kit';
import { SodaxWalletProvider, createWagmiConfig } from '@sodax/wallet-sdk-react';
import type { RpcConfig } from '@sodax/types';

const rpcConfig: RpcConfig = {
  'sonic': 'https://rpc.soniclabs.com',
  '0xa4b1.arbitrum': 'https://arb1.arbitrum.io/rpc',
  '0xa86a.avax': 'https://api.avax.network/ext/bc/C/rpc',
  '0x2105.base': 'https://mainnet.base.org',
  '0x38.bsc': 'https://bsc-dataseed.binance.org',
  '0xa.optimism': 'https://mainnet.optimism.io',
  '0x89.polygon': 'https://polygon-rpc.com',
  'ethereum': 'https://eth.llamarpc.com',
  'stellar': { horizonRpcUrl: 'https://horizon.stellar.org', sorobanRpcUrl: 'https://rpc.ankr.com/stellar_soroban' },
};

const wagmiConfig = createWagmiConfig(rpcConfig);
const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider>
          <SodaxProvider rpcConfig={rpcConfig}>
            <SodaxWalletProvider rpcConfig={rpcConfig}>
              {children}
            </SodaxWalletProvider>
          </SodaxProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
```

```typescript
// app/layout.tsx
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html><body>
      <AppProviders>{children}</AppProviders>
    </body></html>
  );
}
```

## Spoke Provider Pattern

To execute SDK operations, you need a SpokeProvider (wraps wallet + chain config):

```typescript
import { EvmSpokeProvider, SonicSpokeProvider } from '@sodax/sdk';
import { useWalletProvider } from '@sodax/wallet-sdk-react';
import { useSodaxContext } from '@sodax/dapp-kit';

function useCreateSpokeProvider(chainId: ChainId) {
  const walletProvider = useWalletProvider(chainId);
  const { sodax } = useSodaxContext();

  // For EVM spoke chains:
  const spokeConfig = sodax.config.spokeChainConfig[chainId];
  if (walletProvider) {
    return new EvmSpokeProvider(walletProvider, spokeConfig);
  }
  return undefined;
}
```

The `useSpokeProvider` and `useHubProvider` hooks from dapp-kit handle this automatically:

```typescript
import { useSpokeProvider, useHubProvider } from '@sodax/dapp-kit';

const spokeProvider = useSpokeProvider(chainId, walletProvider);
const hubProvider = useHubProvider();
```

## RpcConfig Shape

```typescript
type RpcConfig = Partial<{
  [K in ChainId]: K extends 'stellar'
    ? { horizonRpcUrl?: string; sorobanRpcUrl?: string }
    : string;
}>;
```

## File Locations

| File | Path |
|------|------|
| SodaxProvider | `packages/dapp-kit/src/providers/SodaxProvider.tsx` |
| SodaxContext | `packages/dapp-kit/src/contexts/index.ts` |
| useSodaxContext | `packages/dapp-kit/src/hooks/shared/useSodaxContext.ts` |
| All hook exports | `packages/dapp-kit/src/hooks/index.ts` |
| SodaxWalletProvider | `packages/wallet-sdk-react/src/SodaxWalletProvider.tsx` |
| createWagmiConfig | `packages/wallet-sdk-react/src/xchains/evm/EvmXService.ts` |
| Demo app bootstrap | `apps/demo/src/App.tsx` + `apps/demo/src/index.tsx` |
| Web app bootstrap | `apps/web/app/layout.tsx` + `apps/web/app/(apps)/layout.tsx` |
