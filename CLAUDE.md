# SODAX Frontend SDK Skills

Claude Code memory files for the [sodax-frontend](https://github.com/icon-project/sodax-frontend) monorepo.

## Repository

- **Repo**: `icon-project/sodax-frontend`
- **Stack**: TypeScript, pnpm monorepo, Turborepo, Next.js 15, React 19
- **Architecture**: Hub-and-Spoke (Sonic hub, 16 spoke chains), intent-based cross-chain swaps
- **Key packages**: `@sodax/sdk`, `@sodax/dapp-kit`, `@sodax/wallet-sdk-react`, `@sodax/types`

## Skills Reference

| # | Skill | File |
|---|-------|------|
| 00 | **Repo Map** — full inventory of apps, packages, chains, services, CI/CD | `memory/skills/00-repo-map.md` |
| 01 | **SDK Setup** — Sodax class init, ConfigService, chain IDs, partner fees | `memory/skills/01-sdk-setup.md` |
| 02 | **Wallet Connection** — XConnect/XDisconnect, XAccount, XBalances, chain providers | `memory/skills/02-wallet-connection.md` |
| 03 | **React Provider Bootstrap** — SodaxProvider, provider tree, 60+ hook catalog | `memory/skills/03-react-provider-bootstrap.md` |
| 04 | **Cross-Chain Swap** — quote, approve, swap, poll, slippage, error handling | `memory/skills/04-cross-chain-swap.md` |
| 05 | **Limit Orders** — create, cancel, monitor limit orders via solver | `memory/skills/05-limit-orders.md` |
| 06 | **Cross-Chain Bridge** — bridge workflow, bridgeable checks, Stellar prereqs | `memory/skills/06-cross-chain-bridge.md` |
| 07 | **Money Market Supply** — deposit, withdraw, reserves, APY, aToken balances | `memory/skills/07-money-market-supply.md` |
| 08 | **Money Market Borrow** — borrow, repay, health factor, math utilities | `memory/skills/08-money-market-borrow.md` |
| 09 | **SODA Staking** — stake, unstake, instant unstake, claim, ratios, penalties | `memory/skills/09-soda-staking.md` |
| 10 | **Token Price & Balance Queries** — CoinGecko prices, multi-chain balances, USD valuations | `memory/skills/10-token-price-balance.md` |
| 11 | **Backend Data Queries** — orderbook, user intents, MM positions via BackendApiService | `memory/skills/11-backend-data-queries.md` |
| 12 | **Gas Estimation** — estimate gas for any Sodax operation across all chains | `memory/skills/12-gas-estimation.md` |
| 13 | **Reserve & Position Analytics** — math-utils, ray/wad math, formatted reserves & user summaries | `memory/skills/13-reserve-position-analytics.md` |
| 14 | **Partner SDK Integration** — partner fees, fee claiming, co-branded portal | `memory/skills/14-partner-sdk-integration.md` |
| 15 | **Token Migration** — ICX to SODA, bnUSD, BALN to SODA migration flows | `memory/skills/15-token-migration.md` |
| 16 | **Spoke Provider Development** — create providers for EVM, ICON, Sui, Stellar, Solana, Injective | `memory/skills/16-spoke-provider-dev.md` |
| 17 | **Stellar Trustline Management** — check, request, validate trustlines for Stellar operations | `memory/skills/17-stellar-trustline.md` |
| 18 | **CMS Content Management** — articles, news, glossary CRUD via MongoDB + better-auth | `memory/skills/18-cms-content.md` |
| 19 | **Intent Relay & Solver API** — direct relay/solver interaction for advanced intent management | `memory/skills/19-intent-relay-solver-api.md` |

## Company Context

| File | Contents |
|------|----------|
| `memory/context/company.md` | SODAX tools, systems, processes, git flow |

## Skill Tiers

- **Tier 1 — Foundation** (00-03): Start here. Required before anything else.
- **Tier 2 — Core DeFi** (04-09): Main product features. Depends on Tier 1.
- **Tier 3 — Data & Monitoring** (10-13): Prices, queries, gas, analytics. Depends on Tiers 1-2.
- **Tier 4 — Specialised** (14-17): Partner integration, migration, providers, Stellar. Depends on Tiers 1-3.
- **Tier 5 — Content & Admin** (18-19): CMS, solver API. Independent or depends on Tier 1.
