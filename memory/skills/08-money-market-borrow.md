# Skill 8: Money Market — Borrow & Repay

## Quick Reference

**SDK:** `sodax.moneyMarket` (MoneyMarketService) | **Hooks:** `useBorrow`, `useRepay`, `useMMAllowance`, `useMMApprove`, `useUserReservesData`, `useUserFormattedSummary`
**Docs:** `packages/sdk/docs/MONEY_MARKET.md`

---

## Borrow Workflow

```
1. Check Collateral (supply first)  →  2. Check Health Factor  →  3. Borrow  →  4. Monitor Health Factor
```

### Prerequisites
- User must have supplied collateral first (see Skill 7)
- Health factor must remain > 1.0 after borrowing (or liquidation risk)

### Borrow

```typescript
const result = await sodax.moneyMarket.borrow({
  spokeProvider,       // spoke provider for the chain to receive borrowed tokens
  token,               // Token to borrow
  amount,              // bigint — amount to borrow
  onBehalfOf,          // hub wallet address
});
// Returns: Result<BorrowResult>
```

**React hook:**
```typescript
import { useBorrow } from '@sodax/dapp-kit';

const { mutateAsync: borrow, isPending } = useBorrow();
const result = await borrow({ spokeProvider, token, amount, onBehalfOf });
```

### Two-Step (intent only):
```typescript
const intent = await sodax.moneyMarket.createBorrowIntent({ spokeProvider, token, amount, onBehalfOf });
```

---

## Repay Workflow

```
1. Check Allowance  →  2. Approve  →  3. Repay  →  4. Health Factor improves
```

### Check Allowance & Approve

```typescript
const isValid = await sodax.moneyMarket.isAllowanceValid({ spokeProvider, token, amount });
if (!isValid) {
  await sodax.moneyMarket.approve({ spokeProvider, token, amount });
}
```

**React hooks:**
```typescript
import { useMMAllowance, useMMApprove } from '@sodax/dapp-kit';

const { data: hasAllowance } = useMMAllowance({ spokeProvider, token, amount });
const { mutateAsync: approve } = useMMApprove();
```

### Repay

```typescript
const result = await sodax.moneyMarket.repay({
  spokeProvider,
  token,               // Token being repaid
  amount,              // bigint — amount to repay (or MaxUint256 for full debt)
  onBehalfOf,          // hub wallet address
});
// Returns: Result<RepayResult>
```

**React hook:**
```typescript
import { useRepay } from '@sodax/dapp-kit';

const { mutateAsync: repay, isPending } = useRepay();
const result = await repay({ spokeProvider, token, amount, onBehalfOf });
```

### Repay Max (full debt):
```typescript
import { maxUint256 } from 'viem';
await repay({ spokeProvider, token, amount: maxUint256, onBehalfOf });
```

### Two-Step (intent only):
```typescript
const intent = await sodax.moneyMarket.createRepayIntent({ spokeProvider, token, amount, onBehalfOf });
```

---

## Health Factor Monitoring

The health factor indicates liquidation risk:
- **> 1.0** — Safe
- **= 1.0** — At liquidation threshold
- **< 1.0** — Can be liquidated

```typescript
const summary = await sodax.moneyMarket.getUserFormattedSummary(userAddress);
console.log(summary.healthFactor);        // string (e.g. "1.85")
console.log(summary.totalCollateralUSD);  // string
console.log(summary.totalBorrowsUSD);     // string
console.log(summary.availableBorrowsUSD); // string
console.log(summary.currentLiquidationThreshold); // string
```

**React hook:**
```typescript
import { useUserFormattedSummary } from '@sodax/dapp-kit';

const { data: summary } = useUserFormattedSummary(userAddress);
// summary.healthFactor, summary.totalCollateralUSD, etc.
```

---

## Reserve Data (for UI display)

```typescript
import { useReservesUsdFormat } from '@sodax/dapp-kit';

const { data: reserves } = useReservesUsdFormat();
// For each reserve:
// reserve.variableBorrowAPY — borrow APY
// reserve.supplyAPY         — supply APY
// reserve.totalLiquidity    — available to borrow
// reserve.utilizationRate   — how much is being borrowed
```

---

## Math Utilities

The SDK includes Aave-compatible math utilities for interest calculations:

```typescript
import {
  formatReserves,           // Format raw reserve data with USD prices
  formatUserSummary,        // Format user position summary
  calculateCompoundedInterest,
  calculateAvailableBorrows,
} from '@sodax/sdk';
```

Located in `packages/sdk/src/moneyMarket/math-utils/`:
- `formatters/reserve.ts` — Reserve data formatting
- `formatters/user.ts` — User position formatting
- `formatters/usd.ts` — USD value formatting
- `formatters/incentive.ts` — Incentive calculations
- `formatters/compounded-interest.ts` — Interest rate math
- `ray.ts` — Ray math (27 decimal precision)
- `bignumber.ts` — BigNumber utilities

---

## Error Handling

```typescript
import { isMoneyMarketError } from '@sodax/sdk';

const result = await sodax.moneyMarket.borrow(params);
if (!result.ok) {
  // Common errors:
  // - Insufficient collateral
  // - Health factor would drop below 1
  // - Token not available for borrowing
  // - Amount exceeds available liquidity
}
```

## Key Types

```typescript
type MoneyMarketBorrowParams = {
  spokeProvider: SpokeProvider;
  token: Token;
  amount: bigint;
  onBehalfOf: string; // hub wallet address
};

type MoneyMarketRepayParams = {
  spokeProvider: SpokeProvider;
  token: Token;
  amount: bigint;      // use maxUint256 for full repay
  onBehalfOf: string;  // hub wallet address
};
```

## File Locations

| File | Path |
|------|------|
| MoneyMarketService | `packages/sdk/src/moneyMarket/MoneyMarketService.ts` |
| Math utils | `packages/sdk/src/moneyMarket/math-utils/` |
| MM hooks | `packages/dapp-kit/src/hooks/mm/` |
| MM docs | `packages/sdk/docs/MONEY_MARKET.md` |
| Web loans page | `apps/web/app/(apps)/loans/page.tsx` (placeholder) |
| Demo MM page | `apps/demo/src/pages/money-market/page.tsx` |
