# Skill 17: Stellar Trustline Management

## Quick Reference

**SDK:** `StellarSpokeService.hasSufficientTrustline()`, `.requestTrustline()`, `.walletHasSufficientTrustline()`
**Hooks:** `useStellarTrustlineCheck`, `useRequestTrustline`
**Docs:** `packages/sdk/docs/STELLAR_TRUSTLINE.md`

---

## Why Trustlines?

Stellar requires trustlines before a wallet can receive or hold any token. This affects all SODAX operations where Stellar is the **destination chain**.

**Rule of thumb:**
- **Stellar as source:** Trustlines handled automatically by `isAllowanceValid` / `approve`
- **Stellar as destination:** You must manually check + establish trustlines BEFORE executing

---

## Check Trustline (with SpokeProvider)

```typescript
import { StellarSpokeService } from '@sodax/sdk';

const hasTrustline = await StellarSpokeService.hasSufficientTrustline(
  tokenAddress,          // Stellar token contract address
  amount,                // bigint — amount you need to receive
  stellarSpokeProvider,  // StellarSpokeProvider
);
// Returns: boolean
```

## Check Trustline (without SpokeProvider)

```typescript
const hasTrustline = await StellarSpokeService.walletHasSufficientTrustline(
  tokenAddress,         // Stellar token contract
  amount,               // bigint
  walletAddress,        // Stellar wallet address string
  'https://horizon.stellar.org',  // Horizon RPC URL
);
// Returns: boolean
```

## Request (establish) Trustline

```typescript
const txHash = await StellarSpokeService.requestTrustline(
  tokenAddress,          // Stellar token contract
  amount,                // bigint (sets trustline limit)
  stellarSpokeProvider,
  false,                 // false = execute tx, true = return raw tx
);
// Returns: tx hash or raw tx data
```

---

## React Hooks

```typescript
import { useStellarTrustlineCheck, useRequestTrustline } from '@sodax/dapp-kit';

// Check
const { data: hasTrustline } = useStellarTrustlineCheck({
  token: tokenAddress,
  amount,
  stellarSpokeProvider,
});

// Request
const { mutateAsync: requestTrustline } = useRequestTrustline();
await requestTrustline({ token: tokenAddress, amount, stellarSpokeProvider });
```

---

## Complete Pattern (before any Stellar-destination operation)

```typescript
async function ensureStellarTrustline(
  tokenAddress: string,
  amount: bigint,
  stellarSpokeProvider: StellarSpokeProvider,
): Promise<void> {
  const hasTrustline = await StellarSpokeService.hasSufficientTrustline(
    tokenAddress, amount, stellarSpokeProvider
  );

  if (!hasTrustline) {
    console.log('Establishing trustline...');
    const txResult = await StellarSpokeService.requestTrustline(
      tokenAddress, amount, stellarSpokeProvider, false
    );
    // Wait for confirmation before proceeding
    await stellarSpokeProvider.walletProvider.waitForTransactionReceipt(txResult);
    console.log('Trustline established');
  }
}

// Use before swap/bridge/supply/migration to Stellar
await ensureStellarTrustline(destToken, amount, stellarProvider);
await sodax.swaps.swap({ intentParams, spokeProvider }); // now safe
```

---

## Which Operations Need This?

| Operation | Stellar Source | Stellar Destination |
|-----------|--------------|-------------------|
| Swap | Auto-handled | **Manual trustline** |
| Bridge | Auto-handled | **Manual trustline** |
| Money Market | Auto-handled | **Manual trustline** |
| Migration | Auto-handled | **Manual trustline** |
| Staking | Auto-handled | N/A (always to hub) |

---

## Best Practices

1. **Always check before ops** — Use `hasSufficientTrustline` before any Stellar-destination operation
2. **Set sufficient limit** — Trustline limit should be >= expected receive amount (with buffer)
3. **Wait for confirmation** — Always wait for trustline tx to confirm before main operation
4. **Handle errors** — Trustline can fail due to insufficient XLM (needed for tx fees) or network issues
5. **Trustlines persist** — Once established for a token, they persist until explicitly removed

---

## File Locations

| File | Path |
|------|------|
| StellarSpokeService | `packages/sdk/src/shared/services/StellarSpokeService.ts` |
| StellarSpokeProvider | `packages/sdk/src/shared/entities/stellar/StellarSpokeProvider.ts` |
| Trustline hooks | `packages/dapp-kit/src/hooks/shared/useStellarTrustlineCheck.ts`, `useRequestTrustline.ts` |
| Docs | `packages/sdk/docs/STELLAR_TRUSTLINE.md` |
| Web hooks | `apps/web/hooks/useValidateStellarTrustline.ts`, `useActivateStellarAccount.ts` |
