# SODAX Frontend — Repository Map

**Repo:** `icon-project/sodax-frontend` (MIT)
**Architecture:** pnpm monorepo + Turborepo
**Stack:** TypeScript 5.5.4, React 19, Next.js 15, Vite 5, TailwindCSS 4
**Hub chain:** Sonic (EVM, chain ID 146)
**Deployments:** main → dev | staging → staging | production → sodax.com (all Vercel)

---

## Dependency Graph

```
@sodax/types (v0.0.1-rc.2)
       ↑
@sodax/sdk (v0.0.1-rc.5) ←── @sodax/wallet-sdk-core (v0.0.1-rc.5)
       ↑                              ↑
@sodax/dapp-kit (v0.0.1-rc.4)   @sodax/wallet-sdk-react (v0.0.1-test)
       ↑                              ↑
apps/web ──────────────────────────────┘
apps/demo ─────────────────────────────┘
apps/node (sdk + wallet-sdk-core only)
```

---

## Apps

| App | Stack | Purpose | Key Routes/Pages |
|-----|-------|---------|-----------------|
| **apps/web** | Next.js 15, better-auth, MongoDB, RainbowKit | Production site (sodax.com) | /swap, /save, /stake, /loans, /migrate, /partner, /cms, /news, /glossary, /partners |
| **apps/demo** | Vite 5, React Router 7 | SDK demo/reference app | /solver, /money-market, /bridge, /staking, /partner-fee-claim |
| **apps/node** | TypeScript, ts-node | CLI scripts & integration tests | Per-chain scripts, MM ops, migration tests |

## Packages

| Package | Version | Purpose | Peer Deps |
|---------|---------|---------|-----------|
| **@sodax/sdk** | 0.0.1-rc.5 | Core SDK (swap, bridge, MM, staking, migration) | viem |
| **@sodax/dapp-kit** | 0.0.1-rc.4 | React hooks + SodaxProvider (60+ hooks) | React >=18, @tanstack/react-query 5 |
| **@sodax/wallet-sdk-react** | 0.0.1-test | Multi-chain wallet React hooks | React >=19, @tanstack/react-query 5 |
| **@sodax/wallet-sdk-core** | 0.0.1-rc.5 | WalletProvider implementations (6 chains) | — |
| **@sodax/types** | 0.0.1-rc.2 | Shared TypeScript types & constants | — |
| **@sodax/typescript-config** | — | Shared tsconfig presets | — |

## Supported Chains (17)

| Chain | Type | ChainId Constant |
|-------|------|-----------------|
| Sonic (hub) | EVM | `SONIC_MAINNET_CHAIN_ID` = `'sonic'` |
| Arbitrum | EVM | `ARBITRUM_MAINNET_CHAIN_ID` = `'0xa4b1.arbitrum'` |
| Avalanche | EVM | `AVALANCHE_MAINNET_CHAIN_ID` = `'0xa86a.avax'` |
| Base | EVM | `BASE_MAINNET_CHAIN_ID` = `'0x2105.base'` |
| BNB Chain | EVM | `BSC_MAINNET_CHAIN_ID` = `'0x38.bsc'` |
| Ethereum | EVM | `ETHEREUM_MAINNET_CHAIN_ID` = `'ethereum'` |
| HyperEVM | EVM | `HYPEREVM_MAINNET_CHAIN_ID` = `'hyper'` |
| Kaia | EVM | `KAIA_MAINNET_CHAIN_ID` = `'0x2019.kaia'` |
| LightLink | EVM | `LIGHTLINK_MAINNET_CHAIN_ID` = `'lightlink'` |
| Optimism | EVM | `OPTIMISM_MAINNET_CHAIN_ID` = `'0xa.optimism'` |
| Polygon | EVM | `POLYGON_MAINNET_CHAIN_ID` = `'0x89.polygon'` |
| Redbelly | EVM | `REDBELLY_MAINNET_CHAIN_ID` = `'redbelly'` |
| ICON | ICON | `ICON_MAINNET_CHAIN_ID` = `'0x1.icon'` |
| Injective | INJECTIVE | `INJECTIVE_MAINNET_CHAIN_ID` = `'injective-1'` |
| Solana | SOLANA | `SOLANA_MAINNET_CHAIN_ID` = `'solana'` |
| Stellar | STELLAR | `STELLAR_MAINNET_CHAIN_ID` = `'stellar'` |
| SUI | SUI | `SUI_MAINNET_CHAIN_ID` = `'sui'` |

## SDK Services

| Service | Access | Features |
|---------|--------|----------|
| SwapService | `sodax.swaps` | getQuote, swap, createLimitOrder, cancel, getStatus |
| BridgeService | `sodax.bridge` | bridge, getBridgeableTokens, getBridgeableAmount |
| MoneyMarketService | `sodax.moneyMarket` | supply, borrow, withdraw, repay, reserves data |
| StakingService | `sodax.staking` | stake, unstake, instantUnstake, claim, cancel |
| MigrationService | `sodax.migration` | ICX→SODA, bnUSD migration, BALN→SODA |
| PartnerService | `sodax.partners` | Fee claims |
| BackendApiService | `sodax.backendApi` | Orderbook, intents, MM positions |
| ConfigService | `sodax.config` | Chains, tokens, hub assets, reserves |

## CI/CD

| Workflow | Trigger |
|----------|---------|
| `ci.yml` | Push/PR to main — lint, build, typecheck |
| `sodax-sdk-publish.yml` | Tag `sdk@*` |
| `sodax-dapp-kit-publish.yml` | Tag `dapp-kit@*` |
| `sodax-wallet-react-publish.yml` | Tag `wallet-sdk-react@*` |
| `sodax-wallet-core-publish.yml` | Tag `wallet-sdk-core@*` |
| `sodax-types-publish.yml` | Tag `types@*` |

## SDK Documentation

17 doc files in `packages/sdk/docs/`:
CONFIGURE_SDK, WALLET_PROVIDERS, HOW_TO_MAKE_A_SWAP, SWAPS, BRIDGE, MONEY_MARKET, STAKING, MIGRATION, MONETIZE_SDK, BACKEND_API, ESTIMATE_GAS, HOW_TO_CREATE_A_SPOKE_PROVIDER, INTENT_RELAY_API, RELAYER_API_ENDPOINTS, SOLVER_API_ENDPOINTS, STELLAR_TRUSTLINE, installation/nextjs

## Security Audits

5 audit reports in `/audits/`:
- Collaborative Audit (2025.08.01)
- Relay Audit (2025.11.12)
- Soroban Smart Contract Audit
- Solana Smart Contract Audit
- Sui Smart Contract Audit
