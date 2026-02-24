# Skill 5: Limit Order Management

## Quick Reference

**SDK:** `sodax.swaps` (SwapService) | **Hooks:** `useCreateLimitOrder`, `useCancelLimitOrder`, `useStatus`
**Docs:** `packages/sdk/docs/SWAPS.md` (limit order section)

---

## Create a Limit Order

```typescript
import type { CreateLimitOrderParams } from '@sodax/sdk';

const limitOrderParams: CreateLimitOrderParams = {
  spokeProvider,
  tokenSrc: sourceToken,              // Token object
  tokenSrcChainId: '0xa4b1.arbitrum', // source chain
  tokenDst: destToken,                // Token object
  tokenDstChainId: '0x89.polygon',    // destination chain
  amount: 1000000000000000000n,        // input amount in token decimals
  limitPrice: 2500000000n,             // price limit (output amount per input unit)
  toAddress: destinationWallet,        // destination wallet address
  deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
};

const result = await sodax.swaps.createLimitOrder(limitOrderParams);
// Returns: Result<{ intentHash: string }>
```

**React hook:**
```typescript
import { useCreateLimitOrder } from '@sodax/dapp-kit';

const { mutateAsync: createLimitOrder, isPending } = useCreateLimitOrder();
const result = await createLimitOrder(limitOrderParams);
```

## Cancel a Limit Order

```typescript
const cancelResult = await sodax.swaps.cancelLimitOrder({
  spokeProvider,
  intentHash,
});
```

**React hook:**
```typescript
import { useCancelLimitOrder } from '@sodax/dapp-kit';

const { mutateAsync: cancelLimitOrder } = useCancelLimitOrder();
await cancelLimitOrder({ spokeProvider, intentHash });
```

## Monitor Order Status

Same as market swaps — use `getStatus()` or `useStatus()`:

```typescript
import { useStatus } from '@sodax/dapp-kit';

const { data: status } = useStatus(intentHash);
// status: 'pending' | 'filled' | 'cancelled' | 'expired'
```

## Approval Flow

Limit orders require the same allowance/approval as market swaps:

```typescript
// Check allowance
const hasAllowance = await sodax.swaps.isAllowanceValid({ spokeProvider, token, amount });

// Approve if needed
if (!hasAllowance) {
  await sodax.swaps.approve({ spokeProvider, token, amount });
}

// Then create limit order
await sodax.swaps.createLimitOrder(params);
```

## Key Differences from Market Swaps

| Aspect | Market Swap | Limit Order |
|--------|-------------|-------------|
| Pricing | Best available (from solver quote) | User-specified limit price |
| Execution | Immediate (solver fills ASAP) | When market reaches limit price |
| Deadline | Short (minutes) | Long (hours/days) |
| Quote needed | Yes (getQuote first) | No (price set by user) |
| Cancellation | `cancelSwap()` | `cancelLimitOrder()` |

## File Locations

| File | Path |
|------|------|
| SwapService (includes limit) | `packages/sdk/src/swap/SwapService.ts` |
| useCreateLimitOrder | `packages/dapp-kit/src/hooks/swap/useCreateLimitOrder.ts` |
| useCancelLimitOrder | `packages/dapp-kit/src/hooks/swap/useCancelLimitOrder.ts` |
| Demo UI | `apps/demo/src/components/solver/LimitOrderCard.tsx` |
