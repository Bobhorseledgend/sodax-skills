# Skill 12: Gas Estimation

## Quick Reference

**SDK:** `SwapService.estimateGas()`, `MoneyMarketService.estimateGas()`, `SpokeService.estimateGas()`
**Hook:** `useEstimateGas` from `@sodax/dapp-kit`
**Docs:** `packages/sdk/docs/ESTIMATE_GAS.md`

---

## Pattern: Get Raw Transaction → Estimate Gas

All SDK operation methods accept a `raw: true` flag that returns raw (unsigned) transaction data instead of executing. You then estimate gas from the raw tx.

### Swap Gas Estimation

```typescript
import { SwapService } from '@sodax/sdk';

// Step 1: Create intent with raw=true
const rawResult = await sodax.swaps.createIntent(
  createIntentParams,
  spokeProvider,
  partnerFee,
  true,  // ← raw = true → returns raw tx
);

// Step 2: Estimate gas from raw tx
if (rawResult.ok) {
  const [rawTx, intent] = rawResult.value;
  const gasEstimate = await SwapService.estimateGas(rawTx, spokeProvider);

  if (gasEstimate.ok) {
    console.log('Gas estimate:', gasEstimate.value); // bigint
  }
}
```

### Money Market Gas Estimation

```typescript
import { MoneyMarketService } from '@sodax/sdk';

// Step 1: Create supply intent with raw=true
const rawResult = await sodax.moneyMarket.createSupplyIntent(
  supplyParams,
  spokeProvider,
  true,  // ← raw = true
);

// Step 2: Estimate gas
if (rawResult.ok) {
  const rawTx = rawResult.value;
  const gasEstimate = await MoneyMarketService.estimateGas(rawTx, spokeProvider);
}
```

### Approval Gas Estimation

```typescript
import { SpokeService } from '@sodax/sdk';

// Step 1: Get raw approve tx
const rawResult = await sodax.swaps.approve(
  tokenAddress,
  amount,
  spokeProvider,
  true,  // ← raw = true
);

// Step 2: Estimate gas
if (rawResult.ok) {
  const rawTx = rawResult.value;
  const gasEstimate = await SpokeService.estimateGas(rawTx, spokeProvider);
}
```

## React Hook

```typescript
import { useEstimateGas } from '@sodax/dapp-kit';

const { data: gasEstimate, isLoading } = useEstimateGas({
  rawTx,           // raw transaction data from any SDK method with raw=true
  spokeProvider,   // the spoke provider for the chain
});
// gasEstimate: bigint | undefined
```

## Key Points

- **Static methods** — `estimateGas()` is a static method on service classes
- All services support it: `SwapService`, `MoneyMarketService`, `SpokeService`
- Returns `Result<bigint>` — gas amount in native units
- Requires a spoke provider to query the chain's gas estimation
- Works for: swaps, approvals, supply, borrow, withdraw, repay, bridge, staking

## File Locations

| File | Path |
|------|------|
| Docs | `packages/sdk/docs/ESTIMATE_GAS.md` |
| useEstimateGas | `packages/dapp-kit/src/hooks/shared/useEstimateGas.ts` |
| Node test | `apps/node/src/tests/estimate-gas.test.ts` |
