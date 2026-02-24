# Skill 13: Reserve & Position Analytics

## Quick Reference

**SDK:** `packages/sdk/src/moneyMarket/math-utils/` (31 files, ported from Aave)
**Hooks:** `useReservesData`, `useUserReservesData`, `useReservesHumanized`, `useReservesUsdFormat`, `useUserFormattedSummary`
**Backend:** `useBackendAllMoneyMarketAssets`, `useBackendMoneyMarketPosition`

---

## Data Flow: On-Chain → Formatted

```
On-chain (raw)  →  Humanized (readable)  →  USD Formatted  →  User Summary
useReservesData    useReservesHumanized      useReservesUsdFormat   useUserFormattedSummary
```

---

## Reserve Data (on-chain raw)

```typescript
import { useReservesData } from '@sodax/dapp-kit';

const { data: reserves } = useReservesData();
// Returns: ReserveData[] — raw on-chain reserve configurations
// Fields: underlyingAsset, aTokenAddress, variableDebtTokenAddress,
//         liquidityRate, variableBorrowRate, liquidityIndex, variableBorrowIndex,
//         lastUpdateTimestamp, baseLTVasCollateral, reserveLiquidationThreshold, etc.
```

## Reserves Humanized

```typescript
import { useReservesHumanized } from '@sodax/dapp-kit';

const { data: humanized } = useReservesHumanized();
// Returns: reserves with human-readable numbers (string representations)
// Converts ray (27 decimals) values to readable format
```

## Reserves USD Format

```typescript
import { useReservesUsdFormat } from '@sodax/dapp-kit';

const { data: usdReserves } = useReservesUsdFormat();
// Returns: reserves with USD-denominated values
// Includes: totalLiquidityUSD, totalBorrowsUSD, availableLiquidityUSD, priceInUSD
```

## User Reserves Data

```typescript
import { useUserReservesData } from '@sodax/dapp-kit';

const { data: userReserves } = useUserReservesData(hubWalletAddress);
// Returns: per-reserve user position data
// Fields: underlyingAsset, scaledATokenBalance, scaledVariableDebt, etc.
```

## User Formatted Summary (most useful)

```typescript
import { useUserFormattedSummary } from '@sodax/dapp-kit';

const { data: summary } = useUserFormattedSummary(hubWalletAddress);
// Returns complete user portfolio:
// - totalCollateralUSD: string
// - totalBorrowsUSD: string
// - availableBorrowsUSD: string
// - healthFactor: string (>1 = safe, <1 = liquidatable)
// - netAPY: string
// - userReservesData: formatted per-asset positions
```

## aToken Balances

```typescript
import { useATokensBalances, useAToken } from '@sodax/dapp-kit';

// All aToken balances
const { data: balances } = useATokensBalances(hubWalletAddress);
// Returns: Record<aTokenAddress, bigint>

// Single aToken balance
const { data: balance } = useAToken(aTokenAddress, hubWalletAddress);
// Returns: bigint
```

## Reserve List

```typescript
import { useReservesList } from '@sodax/dapp-kit';

const { data: reserves } = useReservesList();
// Returns: Address[] — list of reserve asset addresses
```

---

## Math Utils (SDK internal, packages/sdk/src/moneyMarket/math-utils/)

Low-level formatting functions (ported from Aave V3). Use the hooks above instead of calling these directly.

### Key modules:

| Module | Functions |
|--------|-----------|
| `bignumber.ts` | BigNumberValue, valueToBigNumber, valueToZDBigNumber, normalize, normalizeBN |
| `ray.math.ts` | RAY, HALF_RAY, rayMul, rayDiv, rayPow, rayToWad, wadToRay |
| `pool-math.ts` | calculateCompoundedInterest, calculateLinearInterest, getCompoundedBalance, getLinearBalance |
| `formatters/reserve/` | formatReserveData, calculateAPY, calculateUtilisation |
| `formatters/user/` | formatUserReserveData, calculateHealthFactor, calculateBorrowPower |
| `formatters/usd/` | formatReserveUSD, calculateUSDValues |
| `formatters/incentive/` | calculateIncentiveAPR |
| `formatters/compounded-interest/` | getCompoundedInterest |
| `formatters/emode/` | formatEMode |

### Math Constants

```typescript
const RAY = 10n ** 27n;              // 1e27 — ray precision
const WAD = 10n ** 18n;              // 1e18 — wad precision
const HALF_RAY = RAY / 2n;
const SECONDS_PER_YEAR = 31536000;
```

### Common Calculations

```typescript
// APY from ray rate
const apy = ((1 + rate / RAY) ** SECONDS_PER_YEAR) - 1;

// Health factor
const healthFactor = totalCollateralETH * liquidationThreshold / totalBorrowsETH;
// healthFactor > 1 = safe, < 1 = can be liquidated

// Utilisation rate
const utilisation = totalBorrows / (totalBorrows + availableLiquidity);
```

---

## Backend Analytics (pre-aggregated)

For simpler analytics without on-chain reads:

```typescript
import { useBackendAllMoneyMarketAssets } from '@sodax/dapp-kit';

const { data: assets } = useBackendAllMoneyMarketAssets();
// Each asset includes: totalSuppliers, totalBorrowers, liquidityRate, variableBorrowRate,
//                       totalATokenBalance, totalVariableDebtTokenBalance
```

---

## Web App Integration

The `apps/web/hooks/useReserveMetrics.ts` and `apps/web/hooks/useAPY.ts` combine these hooks for the Save and Loans pages:

```typescript
// apps/web pattern — useReserveMetrics calculates per-asset metrics
// apps/web pattern — useAPY calculates formatted APY string from reserve data
```

---

## File Locations

| File | Path |
|------|------|
| Math utils (31 files) | `packages/sdk/src/moneyMarket/math-utils/` |
| Reserve hooks | `packages/dapp-kit/src/hooks/mm/` |
| useReservesData | `packages/dapp-kit/src/hooks/mm/useReservesData.ts` |
| useUserReservesData | `packages/dapp-kit/src/hooks/mm/useUserReservesData.ts` |
| useReservesUsdFormat | `packages/dapp-kit/src/hooks/mm/useReservesUsdFormat.ts` |
| useUserFormattedSummary | `packages/dapp-kit/src/hooks/mm/useUserFormattedSummary.ts` |
| Backend analytics | `packages/dapp-kit/src/hooks/backend/` |
| Web useAPY | `apps/web/hooks/useAPY.ts` |
| Web useReserveMetrics | `apps/web/hooks/useReserveMetrics.ts` |
