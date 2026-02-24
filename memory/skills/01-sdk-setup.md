# Skill 1: SDK Setup & Configuration

## Quick Reference

```
npm install @sodax/sdk @sodax/types viem
```

**Repo:** `icon-project/sodax-frontend` | **Package:** `packages/sdk` (v0.0.1-rc.5)
**Source:** `packages/sdk/src/shared/entities/Sodax.ts`

---

## Core Pattern: Create a Sodax Instance

```typescript
import { Sodax } from '@sodax/sdk';

// Minimal — defaults to Sonic mainnet, no fees
const sodax = new Sodax();

// Optional: fetch latest tokens/chains from backend
await sodax.initialize(); // Result<void> — safe to ignore errors (falls back to defaults)
```

## Available Services (accessed from sodax instance)

| Property | Service | Purpose |
|----------|---------|---------|
| `sodax.swaps` | SwapService | Intent-based cross-chain swaps |
| `sodax.moneyMarket` | MoneyMarketService | Cross-chain lending/borrowing |
| `sodax.bridge` | BridgeService | Cross-chain token transfers |
| `sodax.staking` | StakingService | SODA staking for xSODA |
| `sodax.migration` | MigrationService | ICX/bnUSD/BALN migration |
| `sodax.partners` | PartnerService | Partner fee claims |
| `sodax.backendApi` | BackendApiService | Query intents, orderbook, MM data |
| `sodax.config` | ConfigService | Tokens, chains, hub assets, reserves |
| `sodax.hubProvider` | EvmHubProvider | Sonic hub chain public client |

## SodaxConfig Options

```typescript
import { Sodax, type SodaxConfig, getSolverConfig, getMoneyMarketConfig, getHubChainConfig, SONIC_MAINNET_CHAIN_ID, STELLAR_MAINNET_CHAIN_ID } from '@sodax/sdk';

const config: SodaxConfig = {
  // Swap solver config (optional — defaults to Sonic mainnet solver)
  swap: {
    intentsContract: '0x...', // hub intents contract
    solverApiEndpoint: 'https://...',
    partnerFee: { address: '0x...', percentage: 100 }, // 100 = 1%
  },

  // Money market config (optional — defaults to Sonic mainnet)
  moneyMarket: {
    lendingPool: '0x...',
    uiPoolDataProvider: '0x...',
    poolAddressesProvider: '0x...',
    bnUSD: '0x...',
    bnUSDVault: '0x...',
    partnerFee: { address: '0x...', percentage: 100 },
  },

  // Hub provider config (optional — defaults to Sonic mainnet)
  hubProviderConfig: {
    hubRpcUrl: 'https://rpc.soniclabs.com',
    chainConfig: getHubChainConfig(SONIC_MAINNET_CHAIN_ID),
  },

  // Shared config for internal services (optional)
  sharedConfig: {
    [STELLAR_MAINNET_CHAIN_ID]: {
      horizonRpcUrl: 'https://horizon.stellar.org',
      sorobanRpcUrl: 'https://rpc.ankr.com/stellar_soroban',
    },
  },

  // Relayer endpoint (optional — has default)
  relayerApiEndpoint: 'https://...',

  // Backend API (optional — has default)
  backendApiConfig: { baseURL: 'https://...', timeout: 30000 },
};

const sodax = new Sodax(config);
```

## Partner Fee Configuration

```typescript
import { Sodax, type PartnerFee } from '@sodax/sdk';

// Percentage-based (100 = 1%, 10000 = 100%)
const fee: PartnerFee = { address: '0x...', percentage: 100 };

// Amount-based (in token decimal precision)
const feeAmount: PartnerFee = { address: '0x...', amount: 1000n };

// Apply to swaps only
const sodax = new Sodax({ swap: { partnerFee: fee } });

// Apply to money market only
const sodax2 = new Sodax({ moneyMarket: { partnerFee: fee } });

// Apply to both
const sodax3 = new Sodax({
  swap: { partnerFee: fee },
  moneyMarket: { partnerFee: fee },
});
```

## Dynamic Configuration (ConfigService)

```typescript
// After initialize(), ConfigService has latest token/chain data
await sodax.initialize();

// Query available data
sodax.config.getChains();           // SpokeChainId[]
sodax.config.getSwapTokens();       // tokens per chain
sodax.config.getHubAssets();        // hub asset info per chain
sodax.config.getMoneyMarketTokens(); // MM-supported tokens per chain
sodax.config.getMoneyMarketReserveAssets(); // reserve asset addresses

// Lookups
sodax.config.getHubAssetInfo(chainId, assetAddress);   // HubAssetInfo | undefined
sodax.config.isValidOriginalAssetAddress(chainId, addr); // boolean
sodax.config.isNativeToken(chainId, token);              // boolean
sodax.config.findSupportedTokenBySymbol(chainId, 'USDC'); // XToken | undefined
sodax.config.getSpokeChainConfig;                        // all spoke chain configs
```

## Supported Chain IDs (from @sodax/types)

```typescript
import {
  SONIC_MAINNET_CHAIN_ID,      // 'sonic' (hub chain)
  ARBITRUM_MAINNET_CHAIN_ID,   // '0xa4b1.arbitrum'
  AVALANCHE_MAINNET_CHAIN_ID,  // '0xa86a.avax'
  BASE_MAINNET_CHAIN_ID,       // '0x2105.base'
  BSC_MAINNET_CHAIN_ID,        // '0x38.bsc'
  OPTIMISM_MAINNET_CHAIN_ID,   // '0xa.optimism'
  POLYGON_MAINNET_CHAIN_ID,    // '0x89.polygon'
  ETHEREUM_MAINNET_CHAIN_ID,   // 'ethereum'
  HYPEREVM_MAINNET_CHAIN_ID,   // 'hyper'
  LIGHTLINK_MAINNET_CHAIN_ID,  // 'lightlink'
  REDBELLY_MAINNET_CHAIN_ID,   // 'redbelly'
  KAIA_MAINNET_CHAIN_ID,       // '0x2019.kaia'
  ICON_MAINNET_CHAIN_ID,       // '0x1.icon'
  SUI_MAINNET_CHAIN_ID,        // 'sui'
  INJECTIVE_MAINNET_CHAIN_ID,  // 'injective-1'
  SOLANA_MAINNET_CHAIN_ID,     // 'solana'
  STELLAR_MAINNET_CHAIN_ID,    // 'stellar'
} from '@sodax/types';
```

## Error Pattern

All SDK methods return `Result<T>`:
```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: unknown };
```

## Key Types

```typescript
type SpokeChainId = typeof CHAIN_IDS[number];  // e.g. 'sonic', '0xa4b1.arbitrum'
type ChainType = 'EVM' | 'ICON' | 'INJECTIVE' | 'SUI' | 'STELLAR' | 'SOLANA';
type Token = { symbol: string; name: string; decimals: number; address: string };
type XToken = Token & { xChainId: ChainId };
type HubAssetInfo = { asset: Address; decimal: number; vault: Address };
type Address = `0x${string}`;
```

## File Locations (in repo)

| File | Path |
|------|------|
| Sodax class | `packages/sdk/src/shared/entities/Sodax.ts` |
| ConfigService | `packages/sdk/src/shared/config/ConfigService.ts` |
| Providers | `packages/sdk/src/shared/entities/Providers.ts` |
| Constants | `packages/types/src/constants/index.ts` |
| Common types | `packages/types/src/common/index.ts` |
| SDK docs | `packages/sdk/docs/CONFIGURE_SDK.md` |
| Next.js guide | `packages/sdk/docs/installation/nextjs.md` |
