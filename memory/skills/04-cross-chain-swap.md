# Skill 4: Cross-chain Swap Execution

## Quick Reference

**SDK:** `sodax.swaps` (SwapService) | **Hooks:** `useQuote`, `useSwap`, `useStatus`, `useSwapAllowance`, `useSwapApprove`
**Docs:** `packages/sdk/docs/HOW_TO_MAKE_A_SWAP.md`, `packages/sdk/docs/SWAPS.md`

---

## Full Swap Workflow

```
1. Get Quote  →  2. Check Allowance  →  3. Approve (if needed)  →  4. Execute Swap  →  5. Poll Status
```

## Step 1: Get Quote

```typescript
import type { SolverIntentQuoteRequest } from '@sodax/sdk';

const quoteRequest: SolverIntentQuoteRequest = {
  token_src: '0xNativeOrERC20Address',               // source token address
  token_src_blockchain_id: '0xa4b1.arbitrum',         // source chain
  token_dst: '0xNativeOrERC20Address',                // destination token address
  token_dst_blockchain_id: '0x89.polygon',            // destination chain
  amount: 10000000000000000000n,                       // amount in token decimals (bigint)
  quote_type: 'exact_input',                           // 'exact_input' or 'exact_output'
};

const quote = await sodax.swaps.getQuote(quoteRequest);
// Returns: SolverIntentQuoteResponse with .quoted_amount, .uuid, etc.
```

**React hook:**
```typescript
const { data: quote, isLoading } = useQuote(quoteRequest);
```

## Step 2: Check Allowance

```typescript
const isValid = await sodax.swaps.isAllowanceValid({
  spokeProvider,         // SpokeProvider from wallet
  token: sourceToken,    // Token object
  amount: swapAmount,    // bigint
});
```

**React hook:**
```typescript
const { data: hasAllowance } = useSwapAllowance({ spokeProvider, token, amount });
```

## Step 3: Approve (if needed)

```typescript
if (!isValid) {
  const approveResult = await sodax.swaps.approve({
    spokeProvider,
    token: sourceToken,
    amount: swapAmount,
  });
}
```

**React hook:**
```typescript
const { mutateAsync: approve } = useSwapApprove();
await approve({ spokeProvider, token, amount });
```

## Step 4: Execute Swap

```typescript
import type { CreateIntentParams } from '@sodax/sdk';

const intentParams: CreateIntentParams = {
  quote,                                    // from Step 1
  spokeProvider,                            // wallet-connected spoke provider
  toAddress: destinationWalletAddress,      // destination wallet (can differ from source)
  slippageTolerance: 100,                   // 100 = 1% (basis points, 10000 = 100%)
  deadline: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now (Unix timestamp)
};

const result = await sodax.swaps.swap(intentParams);
// Returns: Result<{ intentHash: string }>
```

**React hook:**
```typescript
const { mutateAsync: swap, isPending } = useSwap();
const result = await swap(intentParams);
```

## Step 5: Poll Status

```typescript
const status = await sodax.swaps.getStatus(intentHash);
// Returns: IntentState object

// Status values:
// 'pending'    — intent submitted, waiting for solver
// 'filled'     — solver has filled the intent
// 'cancelled'  — intent was cancelled
// 'expired'    — intent exceeded deadline
```

**React hook:**
```typescript
const { data: status } = useStatus(intentHash);
```

## Cancel an Intent

```typescript
const cancelResult = await sodax.swaps.cancel({
  spokeProvider,
  intentHash,
});
```

**React hook:**
```typescript
const { mutateAsync: cancel } = useCancelSwap();
await cancel({ spokeProvider, intentHash });
```

## Fee Calculation

```typescript
// Partner fee (configured at SDK init)
const partnerFee = sodax.swaps.getPartnerFee(amount);

// Solver fee (from quote)
const solverFee = sodax.swaps.getSolverFee(quote);
```

## Error Handling

```typescript
import { isSwapError, isIntentCreationError, isIntentSubmitError, isIntentExecutionError } from '@sodax/sdk';

const result = await sodax.swaps.swap(params);
if (!result.ok) {
  if (isIntentCreationError(result.error)) {
    // Failed to create intent on spoke chain
  } else if (isIntentSubmitError(result.error)) {
    // Failed to submit to solver
  } else if (isIntentExecutionError(result.error)) {
    // Solver failed to execute
  }
}
```

## Gas Estimation (without executing)

```typescript
import { SwapService } from '@sodax/sdk';

// Create a RawSpokeProvider (no wallet signing needed)
import { EvmRawSpokeProvider } from '@sodax/sdk';
const rawProvider = new EvmRawSpokeProvider(walletAddress, spokeChainConfig);

const gasEstimate = await SwapService.estimateGas({
  ...intentParams,
  spokeProvider: rawProvider,
});
```

## Native Token Handling

For native tokens (ETH, AVAX, MATIC, etc.), use the zero address:
- EVM: `0x0000000000000000000000000000000000000000`
- ICON: `cx0000000000000000000000000000000000000000`

The SDK handles wrapping/unwrapping internally.

## Stellar Trustline Requirement

Before swapping TO Stellar, the destination wallet must have a trustline for the target asset. Check with:
```typescript
import { useStellarTrustlineCheck, useRequestTrustline } from '@sodax/dapp-kit';
```

## Key Types

```typescript
type CreateIntentParams = {
  quote: SolverIntentQuoteResponse;
  spokeProvider: SpokeProvider;
  toAddress: string;
  slippageTolerance: number;  // basis points (100 = 1%)
  deadline: number;           // Unix timestamp
};

type IntentState = {
  status: 'pending' | 'filled' | 'cancelled' | 'expired';
  intentHash: string;
  // ... additional fields
};
```

## File Locations

| File | Path |
|------|------|
| SwapService | `packages/sdk/src/swap/SwapService.ts` |
| SolverApiService | `packages/sdk/src/swap/SolverApiService.ts` |
| Swap hooks | `packages/dapp-kit/src/hooks/swap/` |
| HOW_TO guide | `packages/sdk/docs/HOW_TO_MAKE_A_SWAP.md` |
| API reference | `packages/sdk/docs/SWAPS.md` |
| Demo page | `apps/demo/src/pages/solver/page.tsx` |
| Web page | `apps/web/app/(apps)/swap/page.tsx` |
