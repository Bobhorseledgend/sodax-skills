# Skill 16: Spoke Provider Development

## Quick Reference

**Docs:** `packages/sdk/docs/HOW_TO_CREATE_A_SPOKE_PROVIDER.md` (1100+ lines, comprehensive)
**Source:** `packages/sdk/src/shared/entities/Providers.ts`
**Wallet Core:** `packages/wallet-sdk-core/`

---

## What is a Spoke Provider?

A container combining:
1. **Wallet Provider** — signs transactions (implements `IEvmWalletProvider`, `ISuiWalletProvider`, etc.)
2. **Chain Config** — addresses, tokens, chain ID (from `spokeChainConfig`)

Create **one per user wallet connection per chain**. Reuse for all SDK operations on that chain.

---

## Regular vs Raw Spoke Providers

| | Regular | Raw |
|---|---------|-----|
| **Wallet** | Full wallet provider (can sign) | Address only |
| **Tx Result** | Transaction hash | Unsigned tx data |
| **Use Case** | Frontend/browser | Backend/gas estimation |

---

## EVM Spoke Provider (12 chains)

```typescript
import { EvmSpokeProvider, EvmRawSpokeProvider, spokeChainConfig, ARBITRUM_MAINNET_CHAIN_ID, type EvmSpokeChainConfig } from '@sodax/sdk';
import { EvmWalletProvider } from '@sodax/wallet-sdk-core';

const chainConfig = spokeChainConfig[ARBITRUM_MAINNET_CHAIN_ID] as EvmSpokeChainConfig;

// Node.js (private key)
const wallet = new EvmWalletProvider({
  privateKey: '0x...',
  chainId: ARBITRUM_MAINNET_CHAIN_ID,
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
});
const provider = new EvmSpokeProvider(wallet, chainConfig);

// Raw (address only, no signing)
const rawProvider = new EvmRawSpokeProvider('0xUserAddress', chainConfig);
```

**EVM chains:** Arbitrum, Avalanche, Base, BSC, Optimism, Polygon, Sonic, Lightlink, HyperEVM, Ethereum, Redbelly, Kaia.

**Sonic special case:** Use `SonicSpokeProvider` / `SonicRawSpokeProvider` (extends with walletRouter).

---

## ICON Spoke Provider

```typescript
import { IconSpokeProvider, IconRawSpokeProvider, spokeChainConfig, ICON_MAINNET_CHAIN_ID, type IconSpokeChainConfig } from '@sodax/sdk';
import { IconWalletProvider } from '@sodax/wallet-sdk-core';

const chainConfig = spokeChainConfig[ICON_MAINNET_CHAIN_ID] as IconSpokeChainConfig;

// Node.js
const wallet = new IconWalletProvider({ privateKey: '0x...', nid: '0x1' });
const provider = new IconSpokeProvider(wallet, chainConfig);

// Raw
const rawProvider = new IconRawSpokeProvider('hxUserAddress', chainConfig);
```

---

## Sui Spoke Provider

```typescript
import { SuiSpokeProvider, SuiRawSpokeProvider, spokeChainConfig, SUI_MAINNET_CHAIN_ID, type SuiSpokeChainConfig } from '@sodax/sdk';
import { SuiWalletProvider } from '@sodax/wallet-sdk-core';

const chainConfig = spokeChainConfig[SUI_MAINNET_CHAIN_ID] as SuiSpokeChainConfig;
const wallet = new SuiWalletProvider({ privateKey: 'suiprivkey1...' });
const provider = new SuiSpokeProvider(wallet, chainConfig);
```

---

## Stellar Spoke Provider

```typescript
import { StellarSpokeProvider, spokeChainConfig, STELLAR_MAINNET_CHAIN_ID, type StellarSpokeChainConfig } from '@sodax/sdk';
import { StellarWalletProvider } from '@sodax/wallet-sdk-core';

const chainConfig = spokeChainConfig[STELLAR_MAINNET_CHAIN_ID] as StellarSpokeChainConfig;
const wallet = new StellarWalletProvider({ secretKey: 'S...' });
const provider = new StellarSpokeProvider(wallet, chainConfig);
```

---

## Solana Spoke Provider

```typescript
import { SolanaSpokeProvider, spokeChainConfig, SOLANA_MAINNET_CHAIN_ID, type SolanaChainConfig } from '@sodax/sdk';
import { SolanaWalletProvider } from '@sodax/wallet-sdk-core';

const chainConfig = spokeChainConfig[SOLANA_MAINNET_CHAIN_ID] as SolanaChainConfig;
const wallet = new SolanaWalletProvider({ secretKey: Uint8Array.from([...]) });
const provider = new SolanaSpokeProvider(wallet, chainConfig);
```

---

## Injective Spoke Provider

```typescript
import { InjectiveSpokeProvider, spokeChainConfig, INJECTIVE_MAINNET_CHAIN_ID, type InjectiveSpokeChainConfig } from '@sodax/sdk';
import { InjectiveWalletProvider } from '@sodax/wallet-sdk-core';

const chainConfig = spokeChainConfig[INJECTIVE_MAINNET_CHAIN_ID] as InjectiveSpokeChainConfig;
const wallet = new InjectiveWalletProvider({ privateKey: '0x...' });
const provider = new InjectiveSpokeProvider(wallet, chainConfig);
```

---

## Getting Chain Config (dynamic)

```typescript
const sodax = new Sodax();
await sodax.initialize(); // latest config from backend

// Access via ConfigService
const config = sodax.config.spokeChainConfig[chainId];
```

---

## Wallet Provider Interfaces

```typescript
// All must implement:
interface IEvmWalletProvider {
  getWalletAddress(): Promise<Address>;
  signTransaction(tx: TransactionRequest): Promise<Hash>;
  sendTransaction(tx: TransactionRequest): Promise<Hash>;
  waitForTransactionReceipt(hash: Hash): Promise<TransactionReceipt>;
  // + chain-specific methods
}

// Similar for ISuiWalletProvider, IIconWalletProvider, IStellarWalletProvider,
// ISolanaWalletProvider, IInjectiveWalletProvider
```

---

## Provider Type Hierarchy

```typescript
type SpokeProvider = EvmSpokeProvider | IconSpokeProvider | SuiSpokeProvider
                   | StellarSpokeProvider | SolanaSpokeProvider | InjectiveSpokeProvider
                   | SonicSpokeProvider;

type RawSpokeProvider = EvmRawSpokeProvider | IconRawSpokeProvider | SuiRawSpokeProvider
                      | StellarRawSpokeProvider | SolanaRawSpokeProvider | InjectiveRawSpokeProvider
                      | SonicRawSpokeProvider;

type SpokeProviderType = SpokeProvider | RawSpokeProvider;
```

---

## File Locations

| File | Path |
|------|------|
| Providers.ts | `packages/sdk/src/shared/entities/Providers.ts` |
| Icon provider | `packages/sdk/src/shared/entities/icon/` |
| Sui provider | `packages/sdk/src/shared/entities/sui/` |
| Stellar provider | `packages/sdk/src/shared/entities/stellar/` |
| Solana provider | `packages/sdk/src/shared/entities/solana/` |
| Injective provider | `packages/sdk/src/shared/entities/injective/` |
| Wallet SDK core | `packages/wallet-sdk-core/` |
| Docs | `packages/sdk/docs/HOW_TO_CREATE_A_SPOKE_PROVIDER.md` |
| Node examples | `apps/node/src/evm.ts`, `icon.ts`, `sui.ts`, `stellar.ts`, `solana.ts`, `injective.ts` |
