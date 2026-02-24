# Skill 6: Cross-chain Bridge

## Quick Reference

**SDK:** `sodax.bridge` (BridgeService) | **Hooks:** `useBridge`, `useBridgeAllowance`, `useBridgeApprove`, `useGetBridgeableTokens`, `useGetBridgeableAmount`
**Docs:** `packages/sdk/docs/BRIDGE.md`

---

## Full Bridge Workflow

```
1. Check Bridgeable Tokens  →  2. Check Amount  →  3. Check Allowance  →  4. Approve  →  5. Bridge
```

## Step 1: Get Bridgeable Tokens

```typescript
const tokens = sodax.bridge.getBridgeableTokens(sourceChainId, destChainId);
// Returns: Token[] — tokens that can be bridged between these chains
```

**React hook:**
```typescript
import { useGetBridgeableTokens } from '@sodax/dapp-kit';
const { data: tokens } = useGetBridgeableTokens(sourceChainId, destChainId);
```

## Step 2: Check Bridgeable Amount

```typescript
const amount = await sodax.bridge.getBridgeableAmount({
  spokeProvider,
  token,
  chainId: sourceChainId,
});
// Returns: bigint — max bridgeable amount for this token
```

**React hook:**
```typescript
import { useGetBridgeableAmount } from '@sodax/dapp-kit';
const { data: maxAmount } = useGetBridgeableAmount({ spokeProvider, token, chainId });
```

## Step 3: Check Allowance

```typescript
const isValid = await sodax.bridge.isAllowanceValid({
  spokeProvider,
  token,
  amount: bridgeAmount,
});
```

**React hook:**
```typescript
import { useBridgeAllowance } from '@sodax/dapp-kit';
const { data: hasAllowance } = useBridgeAllowance({ spokeProvider, token, amount });
```

## Step 4: Approve (if needed)

```typescript
if (!isValid) {
  await sodax.bridge.approve({ spokeProvider, token, amount: bridgeAmount });
}
```

**React hook:**
```typescript
import { useBridgeApprove } from '@sodax/dapp-kit';
const { mutateAsync: approve } = useBridgeApprove();
await approve({ spokeProvider, token, amount });
```

## Step 5: Execute Bridge

```typescript
import type { BridgeParams } from '@sodax/sdk';

const bridgeParams: BridgeParams = {
  spokeProvider,                        // source chain spoke provider
  token,                                // Token to bridge
  amount: bridgeAmount,                 // bigint in token decimals
  fromChainId: '0xa4b1.arbitrum',       // source chain
  toChainId: '0x89.polygon',            // destination chain
  toAddress: destinationWalletAddress,  // recipient address on dest chain
};

const result = await sodax.bridge.bridge(bridgeParams);
// Returns: Result<BridgeResult>
```

**React hook:**
```typescript
import { useBridge } from '@sodax/dapp-kit';

const { mutateAsync: bridge, isPending } = useBridge();
const result = await bridge(bridgeParams);
```

## Two-Step Pattern (create intent only)

For more control, create the bridge intent without auto-submitting:

```typescript
const intent = await sodax.bridge.createBridgeIntent({
  spokeProvider,
  token,
  amount,
  fromChainId,
  toChainId,
  toAddress,
});
// Returns: CreateBridgeIntentResult (raw intent data)
// You then submit it manually via the relayer
```

## Check if Asset is Bridgeable

```typescript
const canBridge = sodax.bridge.isBridgeable(token, sourceChainId, destChainId);
// Returns: boolean
```

## Error Handling

```typescript
const result = await sodax.bridge.bridge(params);
if (!result.ok) {
  console.error('Bridge failed:', result.error);
  // Common errors:
  // - Insufficient allowance
  // - Amount exceeds bridge limit
  // - Token not supported on destination chain
  // - Stellar trustline missing
}
```

## Stellar Trustline Requirement

When bridging TO Stellar, the destination wallet must have a trustline:

```typescript
import { useStellarTrustlineCheck, useRequestTrustline } from '@sodax/dapp-kit';

// Check if trustline exists
const { data: hasTrustline } = useStellarTrustlineCheck({ token, address: stellarAddress });

// Request trustline if missing
const { mutateAsync: requestTrustline } = useRequestTrustline();
await requestTrustline({ token, stellarWalletProvider });
```

## Key Types

```typescript
type BridgeParams = {
  spokeProvider: SpokeProvider;
  token: Token;
  amount: bigint;
  fromChainId: SpokeChainId;
  toChainId: SpokeChainId;
  toAddress: string;
  partnerFee?: PartnerFee;
};

type CreateBridgeIntentParams = BridgeParams; // same shape
```

## File Locations

| File | Path |
|------|------|
| BridgeService | `packages/sdk/src/bridge/BridgeService.ts` |
| Bridge hooks | `packages/dapp-kit/src/hooks/bridge/` |
| Bridge docs | `packages/sdk/docs/BRIDGE.md` |
| Demo page | `apps/demo/src/pages/bridge/page.tsx` |
