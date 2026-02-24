# Skill 2: Multi-chain Wallet Connection

## Quick Reference

```
npm install @sodax/wallet-sdk-react @sodax/wallet-sdk-core @sodax/types
```

**Packages:** `packages/wallet-sdk-react` (v0.0.1-test) + `packages/wallet-sdk-core` (v0.0.1-rc.5)

---

## Architecture Overview

```
@sodax/wallet-sdk-react     — React hooks + chain XServices + XConnectors
       ↓ uses
@sodax/wallet-sdk-core      — WalletProvider implementations (IEvmWalletProvider, etc.)
       ↓ implements
@sodax/types                — Wallet provider interfaces (IEvmWalletProvider, ISuiWalletProvider, etc.)
       ↑ consumed by
@sodax/sdk                  — SpokeProviders require IWalletProvider to execute transactions
```

## Supported Chains & Wallets

| Chain Type | ChainIds | Wallets | XService | XConnector |
|------------|----------|---------|----------|------------|
| EVM | sonic, arbitrum, avalanche, base, bsc, optimism, polygon, ethereum, hyper, lightlink, redbelly, kaia | MetaMask, Hana, Havah | EvmXService | EvmXConnector (wraps wagmi) |
| SUI | sui | Sui Wallet | SuiXService | SuiXConnector (wraps @mysten/dapp-kit) |
| SOLANA | solana | Phantom, MetaMask | SolanaXService | SolanaXConnector (wraps @solana/wallet-adapter) |
| STELLAR | stellar | Various (stellar-wallets-kit) | StellarXService | StellarWalletsKitXConnector |
| ICON | 0x1.icon | Hana | IconXService | IconHanaXConnector |
| INJECTIVE | injective-1 | Keplr, MetaMask | InjectiveXService | InjectiveKelprXConnector, InjectiveMetamaskXConnector |

## React Hooks (from @sodax/wallet-sdk-react)

### Connection Management

```typescript
import { useXConnect, useXDisconnect, useXConnection } from '@sodax/wallet-sdk-react';

// Connect — returns mutation
const { mutateAsync: connect, isPending } = useXConnect();
await connect(connector); // pass an XConnector instance

// Disconnect — returns async function
const disconnect = useXDisconnect();
await disconnect('EVM'); // pass ChainType

// Check connection status
const connection = useXConnection('EVM');
// Returns: { xAccount: { address, xChainType }, xConnectorId } | undefined
```

### Account & Balance Queries

```typescript
import { useXAccount, useXAccounts, useXBalances } from '@sodax/wallet-sdk-react';

// Single chain account
const { address, xChainType } = useXAccount('EVM');
// Can also pass ChainId: useXAccount('0xa4b1.arbitrum')

// All connected accounts
const accounts = useXAccounts();
// Returns: Partial<Record<ChainType, XAccount>>

// Token balances (React Query — auto-refreshes every 5s)
const { data: balances } = useXBalances({
  xChainId: '0xa4b1.arbitrum',
  xTokens: tokens,       // XToken[]
  address: walletAddress, // string | undefined
});
// Returns: { [tokenAddress]: bigint }
```

### Available Connectors

```typescript
import { useXConnectors } from '@sodax/wallet-sdk-react';

const connectors = useXConnectors('EVM');
// Returns: XConnector[] with .id, .name, .icon, .xChainType

// Each connector can be passed to useXConnect():
await connect(connectors[0]);
```

### EVM Chain Switching

```typescript
import { useEvmSwitchChain } from '@sodax/wallet-sdk-react';

const { isWrongChain, handleSwitchChain } = useEvmSwitchChain('0xa4b1.arbitrum');
// isWrongChain: true if connected to different EVM chain
// handleSwitchChain: () => void — triggers chain switch
```

### Get WalletProvider for SDK Operations

```typescript
import { useWalletProvider } from '@sodax/wallet-sdk-react';

// Returns the correct IWalletProvider for any chain
const walletProvider = useWalletProvider('0xa4b1.arbitrum');
// Type: IEvmWalletProvider | ISuiWalletProvider | IIconWalletProvider | ... | undefined

// This is needed to create SpokeProviders for SDK operations (see Skill 3)
```

## Core Abstractions

### XConnector (abstract base class)
```typescript
abstract class XConnector {
  readonly xChainType: ChainType;
  readonly name: string;
  get id(): string;
  get icon(): string | undefined;
  abstract connect(): Promise<XAccount | undefined>;
  abstract disconnect(): Promise<void>;
}
```

### XService (abstract base class)
```typescript
abstract class XService {
  readonly xChainType: ChainType;
  getBalance(address: string | undefined, xToken: XToken): Promise<bigint>;
  getBalances(address: string | undefined, xTokens: XToken[]): Promise<Record<string, bigint>>;
  getXConnectors(): XConnector[];
  getXConnectorById(id: string): XConnector | undefined;
}
```

### XAccount & XConnection Types
```typescript
type XAccount = { address: string | undefined; xChainType: ChainType | undefined };
type XConnection = { xAccount: XAccount; xConnectorId: string };
enum WalletId { METAMASK, HANA, PHANTOM, SUI, KEPLR }
```

## WalletProvider Core (from @sodax/wallet-sdk-core)

These implement the `IWalletProvider` interfaces that the SDK needs:

```typescript
import {
  EvmWalletProvider,      // needs { walletClient, publicClient } or { privateKey, chainId }
  SuiWalletProvider,      // needs { client, wallet, account }
  IconWalletProvider,     // needs { walletAddress, rpcUrl }
  InjectiveWalletProvider, // needs { msgBroadcaster }
  StellarWalletProvider,  // needs { walletsKit, network, type }
  SolanaWalletProvider,   // needs { wallet, connection }
} from '@sodax/wallet-sdk-core';

// EVM example — private key (for Node.js/scripts)
const evmProvider = new EvmWalletProvider({
  privateKey: '0x...',
  chainId: '0xa4b1.arbitrum',
});

// EVM example — browser extension (use useWalletProvider hook instead)
const evmBrowserProvider = new EvmWalletProvider({
  walletClient: wagmiWalletClient,
  publicClient: wagmiPublicClient,
});
```

## Connection Flow (Typical)

1. User clicks "Connect Wallet"
2. UI shows available connectors via `useXConnectors(chainType)`
3. User selects a connector
4. `useXConnect().mutateAsync(connector)` is called
5. Chain-specific flow executes (MetaMask popup, Phantom popup, etc.)
6. Connection stored in zustand (useXWagmiStore)
7. `useXAccount(chainType)` now returns the connected address
8. `useWalletProvider(chainId)` returns the correct IWalletProvider

## Zustand Store (internal)

```typescript
// useXWagmiStore — internal state management
state.xConnections     // Record<ChainType, XConnection>
state.xServices        // Record<ChainType, XService>
state.setXConnection() // called by useXConnect
state.unsetXConnection() // called by useXDisconnect
```

## File Locations

| File | Path |
|------|------|
| React hooks | `packages/wallet-sdk-react/src/hooks/` |
| XConnector base | `packages/wallet-sdk-react/src/core/XConnector.ts` |
| XService base | `packages/wallet-sdk-react/src/core/XService.ts` |
| EVM service | `packages/wallet-sdk-react/src/xchains/evm/EvmXService.ts` |
| EVM connector | `packages/wallet-sdk-react/src/xchains/evm/EvmXConnector.ts` |
| Solana service | `packages/wallet-sdk-react/src/xchains/solana/SolanaXService.ts` |
| Sui service | `packages/wallet-sdk-react/src/xchains/sui/SuiXService.ts` |
| Icon service | `packages/wallet-sdk-react/src/xchains/icon/IconXService.ts` |
| Injective service | `packages/wallet-sdk-react/src/xchains/injective/InjectiveXService.ts` |
| Stellar service | `packages/wallet-sdk-react/src/xchains/stellar/StellarXService.ts` |
| Wallet providers | `packages/wallet-sdk-core/src/wallet-providers/` |
| Types | `packages/wallet-sdk-react/src/types/index.ts` |
| SDK docs | `packages/sdk/docs/WALLET_PROVIDERS.md` |
