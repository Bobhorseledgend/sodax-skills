# Skill 15: Token Migration

## Quick Reference

**SDK:** `sodax.migration` (MigrationService)
**Hooks:** `useMigrate`, `useMigrationAllowance`, `useMigrationApprove`
**Docs:** `packages/sdk/docs/MIGRATION.md`

---

## Migration Types

| Migration | Direction | Source Chain | Dest Chain |
|-----------|-----------|-------------|------------|
| ICX/wICX → SODA | Forward | ICON | Sonic (hub) |
| SODA → wICX | Reverse | Sonic (hub) | ICON |
| Legacy bnUSD → New bnUSD | Forward | ICON, Sui, Stellar | Any spoke chain |
| New bnUSD → Legacy bnUSD | Reverse | Any spoke chain | ICON, Sui, Stellar |
| BALN → SODA | Forward only | ICON | Sonic (hub) |

---

## ICX → SODA Migration

```typescript
const result = await sodax.migration.migrateIcxToSoda(
  {
    address: iconSpokeProvider.chainConfig.addresses.wICX, // wICX address
    amount: BigInt(1000000000000000000),                    // 1 ICX (18 decimals)
    to: '0xRecipientOnSonic',                              // Sonic hub address
  },
  iconSpokeProvider,
  30000,  // optional timeout (default 60000ms)
);

if (result.ok) {
  const [spokeTxHash, hubTxHash] = result.value;
}
```

## SODA → ICX Reverse Migration

```typescript
// 1. Check allowance (SODA needs approval for reverse)
const isAllowed = await sodax.migration.isAllowanceValid(params, 'revert', sonicSpokeProvider);

// 2. Approve if needed
if (!isAllowed.value) {
  await sodax.migration.approve(params, 'revert', sonicSpokeProvider);
}

// 3. Execute revert
const result = await sodax.migration.revertMigrateSodaToIcx(
  { amount: BigInt(1e18), to: 'hxRecipientOnIcon' },
  sonicSpokeProvider,
);

if (result.ok) {
  const [hubTxHash, spokeTxHash] = result.value;
}
```

## bnUSD Migration (unified API)

```typescript
// Forward: legacy → new
const result = await sodax.migration.migratebnUSD(
  {
    srcChainId: '0x1.icon',
    dstChainId: 'sonic',
    srcbnUSD: 'cx88fd7df7ddff82f7cc735c871dc519838cb235bb', // legacy bnUSD
    dstbnUSD: '0xE801CA34E19aBCbFeA12025378D19c4FBE250131', // new bnUSD
    amount: BigInt(1e18),
    to: '0xRecipient',
  },
  iconSpokeProvider,
);

// Reverse: new → legacy (same API, just swap src/dst)
const result = await sodax.migration.migratebnUSD(
  {
    srcChainId: 'sonic',
    dstChainId: '0x1.icon',
    srcbnUSD: '0xE801...', // new bnUSD
    dstbnUSD: 'cx88fd...', // legacy bnUSD
    amount: BigInt(1e18),
    to: 'hxRecipient',
  },
  sonicSpokeProvider,
);
```

## bnUSD Helper Functions

```typescript
import {
  bnUSDLegacySpokeChainIds,    // ['0x1.icon', 'sui', 'stellar']
  newbnUSDSpokeChainIds,        // all chains except ICON
  bnUSDLegacyTokens,            // Token[] of legacy bnUSD tokens
  bnUSDNewTokens,               // Token[] of new bnUSD tokens
  isLegacybnUSDChainId,         // (chainId) → boolean
  isNewbnUSDChainId,            // (chainId) → boolean
  isLegacybnUSDToken,           // (address) → boolean
  isNewbnUSDToken,              // (address) → boolean
  getAllLegacybnUSDTokens,      // () → { token, chainId }[]
} from '@sodax/sdk';
```

## BALN → SODA Migration

```typescript
const result = await sodax.migration.migrateBaln(
  {
    amount: BigInt(1e18),
    lockupPeriod: 'SIX_MONTHS',  // lockup period enum
    to: '0xRecipient',
    stake: true,                  // auto-stake SODA
  },
  iconSpokeProvider,
);
```

## Allowance/Approval Pattern

- **Forward migrations** (ICX, bnUSD, BALN → hub): No allowance needed
- **Reverse migrations** (SODA → ICX, new bnUSD → legacy): Requires SODA/bnUSD approval
- **Stellar destinations**: Need manual trustline check (see Skill 17)

```typescript
// Check
const isAllowed = await sodax.migration.isAllowanceValid(params, 'migrate' | 'revert', spokeProvider);

// Approve
const approveTx = await sodax.migration.approve(params, 'migrate' | 'revert', spokeProvider);
```

## React Hooks

```typescript
import { useMigrate, useMigrationAllowance, useMigrationApprove } from '@sodax/dapp-kit';

const { data: hasAllowance } = useMigrationAllowance({ params, direction, spokeProvider });
const { mutateAsync: approve } = useMigrationApprove();
const { mutateAsync: migrate } = useMigrate();
```

## Error Codes

- `MIGRATION_FAILED` — General failure
- `CREATE_MIGRATION_INTENT_FAILED` — Intent creation failed
- `CREATE_REVERT_MIGRATION_INTENT_FAILED` — Revert intent failed
- `REVERT_MIGRATION_FAILED` — Revert execution failed
- `RelayError` — Relay service errors

## File Locations

| File | Path |
|------|------|
| MigrationService | `packages/sdk/src/migration/MigrationService.ts` |
| IcxMigrationService | `packages/sdk/src/migration/IcxMigrationService.ts` |
| BnUSDMigrationService | `packages/sdk/src/migration/BnUSDMigrationService.ts` |
| BalnSwapService | `packages/sdk/src/migration/BalnSwapService.ts` |
| Migration hooks | `packages/dapp-kit/src/hooks/migrate/` |
| Docs | `packages/sdk/docs/MIGRATION.md` |
| Web migrate page | `apps/web/app/(apps)/migrate/page.tsx` |
