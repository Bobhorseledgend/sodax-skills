# Skill 7: Money Market — Supply & Withdraw

## Quick Reference

**SDK:** `sodax.moneyMarket` (MoneyMarketService) | **Hooks:** `useSupply`, `useWithdraw`, `useMMAllowance`, `useMMApprove`, `useReservesData`, `useReservesUsdFormat`, `useAToken`, `useATokensBalances`
**Docs:** `packages/sdk/docs/MONEY_MARKET.md`

---

## Supply (Deposit) Workflow

```
1. Get Reserves Data (APY)  →  2. Check Allowance  →  3. Approve  →  4. Supply  →  5. Monitor aToken balance
```

### Step 1: Get Reserve Data (APY, liquidity, etc.)

```typescript
// Raw on-chain data
const reserves = await sodax.moneyMarket.getReservesData();
// Returns: ReservesDataResult

// Humanized (formatted numbers)
const humanized = await sodax.moneyMarket.getReservesHumanized();
// Returns: ReservesDataHumanized

// Full USD-formatted data
const usdFormatted = await sodax.moneyMarket.getReservesUsdFormat();
// Returns: FormattedReserves with APY, TVL, prices
```

**React hooks:**
```typescript
import { useReservesData, useReservesUsdFormat } from '@sodax/dapp-kit';

const { data: reserves } = useReservesData();
const { data: formattedReserves } = useReservesUsdFormat();
// formattedReserves[i].supplyAPY — annualised supply APY as string
// formattedReserves[i].totalLiquidity — total liquidity in USD
```

### Step 2-3: Check Allowance & Approve

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
await approve({ spokeProvider, token, amount });
```

### Step 4: Supply

```typescript
const result = await sodax.moneyMarket.supply({
  spokeProvider,       // wallet-connected spoke provider
  token,               // Token to supply
  amount,              // bigint in token decimals
  onBehalfOf,          // hub wallet address (derived from spoke wallet)
});
// Returns: Result<SupplyResult>
```

**React hook:**
```typescript
import { useSupply } from '@sodax/dapp-kit';

const { mutateAsync: supply, isPending } = useSupply();
const result = await supply({ spokeProvider, token, amount, onBehalfOf });
```

### Step 5: Check aToken Balance (proof of deposit)

```typescript
// Single aToken balance
const balance = await sodax.moneyMarket.getATokenBalance({ hubProvider, aTokenAddress, userAddress });

// All aToken balances
const balances = await sodax.moneyMarket.getATokensBalances({ hubProvider, userAddress });
```

**React hooks:**
```typescript
import { useAToken, useATokensBalances } from '@sodax/dapp-kit';

const { data: aTokenBalance } = useAToken({ aTokenAddress, userAddress });
const { data: allBalances } = useATokensBalances({ userAddress });
```

---

## Withdraw Workflow

```
1. Check aToken balance  →  2. Withdraw (no approval needed — aTokens are burned)
```

```typescript
const result = await sodax.moneyMarket.withdraw({
  spokeProvider,       // spoke provider for the chain you want to receive on
  token,               // underlying Token to withdraw
  amount,              // bigint — amount to withdraw (or MaxUint256 for full)
  toAddress,           // destination wallet address
});
// Returns: Result<WithdrawResult>
```

**React hook:**
```typescript
import { useWithdraw } from '@sodax/dapp-kit';

const { mutateAsync: withdraw, isPending } = useWithdraw();
const result = await withdraw({ spokeProvider, token, amount, toAddress });
```

### Withdraw Max

To withdraw entire position, use `MaxUint256`:
```typescript
import { maxUint256 } from 'viem';
await withdraw({ spokeProvider, token, amount: maxUint256, toAddress });
```

---

## Two-Step Pattern (create intent only)

For more control over submission:

```typescript
// Supply
const intent = await sodax.moneyMarket.createSupplyIntent({ spokeProvider, token, amount, onBehalfOf });
// Then submit manually

// Withdraw
const intent = await sodax.moneyMarket.createWithdrawIntent({ spokeProvider, token, amount, toAddress });
```

---

## User Position Data

```typescript
// Get user's reserves (what they've supplied/borrowed)
const userData = await sodax.moneyMarket.getUserReservesData(userAddress);

// Get formatted summary with USD values
const summary = await sodax.moneyMarket.getUserFormattedSummary(userAddress);
// summary.totalCollateralUSD, summary.totalBorrowsUSD, summary.healthFactor, etc.
```

**React hooks:**
```typescript
import { useUserReservesData, useUserFormattedSummary } from '@sodax/dapp-kit';

const { data: userReserves } = useUserReservesData(userAddress);
const { data: userSummary } = useUserFormattedSummary(userAddress);
```

---

## Error Handling

```typescript
import { isMoneyMarketError } from '@sodax/sdk';

const result = await sodax.moneyMarket.supply(params);
if (!result.ok) {
  if (isMoneyMarketError(result.error)) {
    // Typed MM error
  }
}
```

## Key Types

```typescript
type MoneyMarketSupplyParams = {
  spokeProvider: SpokeProvider;
  token: Token;
  amount: bigint;
  onBehalfOf: string;  // hub wallet address
};

type MoneyMarketWithdrawParams = {
  spokeProvider: SpokeProvider;
  token: Token;
  amount: bigint;
  toAddress: string;
};
```

## File Locations

| File | Path |
|------|------|
| MoneyMarketService | `packages/sdk/src/moneyMarket/MoneyMarketService.ts` |
| MoneyMarketDataService | `packages/sdk/src/moneyMarket/MoneyMarketDataService.ts` |
| Math utilities | `packages/sdk/src/moneyMarket/math-utils/` |
| MM hooks | `packages/dapp-kit/src/hooks/mm/` |
| MM docs | `packages/sdk/docs/MONEY_MARKET.md` |
| Web save page | `apps/web/app/(apps)/save/page.tsx` |
| Demo MM page | `apps/demo/src/pages/money-market/page.tsx` |
