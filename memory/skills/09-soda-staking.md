# Skill 9: SODA Staking

## Quick Reference

**SDK:** `sodax.staking` (StakingService) | **Hooks:** `useStake`, `useUnstake`, `useInstantUnstake`, `useClaim`, `useCancelUnstake`, + allowance/approve/info hooks
**Docs:** `packages/sdk/docs/STAKING.md`

---

## Staking Overview

- **Stake SODA** → receive **xSODA** (liquid staking token)
- **Unstake xSODA** → receive SODA after 7-day cooldown
- **Instant Unstake** → receive SODA immediately with penalty (variable ratio)
- **xSODA appreciates** over time vs SODA (staking rewards accrue to ratio)

---

## Stake SODA

```
1. Check Allowance  →  2. Approve  →  3. Stake  →  4. Receive xSODA
```

```typescript
// Check allowance
const isValid = await sodax.staking.isAllowanceValid({ spokeProvider, token: sodaToken, amount });

// Approve if needed
if (!isValid) {
  await sodax.staking.approve({ spokeProvider, token: sodaToken, amount });
}

// Stake
const result = await sodax.staking.stake({
  spokeProvider,
  amount,           // bigint — SODA amount to stake
  fromChainId,      // chain where SODA is held
});
// Returns: Result<StakeResult>
```

**React hooks:**
```typescript
import { useStakeAllowance, useStakeApprove, useStake } from '@sodax/dapp-kit';

const { data: hasAllowance } = useStakeAllowance({ spokeProvider, token, amount });
const { mutateAsync: approve } = useStakeApprove();
const { mutateAsync: stake, isPending } = useStake();

await approve({ spokeProvider, token, amount });
const result = await stake({ spokeProvider, amount, fromChainId });
```

---

## Unstake xSODA (7-day cooldown)

```typescript
// Check xSODA allowance
const isValid = await sodax.staking.isAllowanceValid({ spokeProvider, token: xSodaToken, amount });

// Approve xSODA
if (!isValid) {
  await sodax.staking.approve({ spokeProvider, token: xSodaToken, amount });
}

// Unstake (starts cooldown)
const result = await sodax.staking.unstake({
  spokeProvider,
  amount,           // bigint — xSODA amount to unstake
  fromChainId,
});
```

**React hooks:**
```typescript
import { useUnstakeAllowance, useUnstakeApprove, useUnstake } from '@sodax/dapp-kit';

const { mutateAsync: unstake } = useUnstake();
const result = await unstake({ spokeProvider, amount, fromChainId });
```

---

## Instant Unstake (with penalty)

Converts xSODA to SODA immediately but at a discounted ratio:

```typescript
// Get current instant unstake ratio
const ratio = await sodax.staking.getInstantUnstakeRatio();
// Returns: bigint — e.g. 950000000000000000n = 0.95 (5% penalty)

// Execute instant unstake
const result = await sodax.staking.instantUnstake({
  spokeProvider,
  amount,              // xSODA amount
  minReceiveAmount,    // minimum SODA to receive (slippage protection)
  fromChainId,
});
```

**React hooks:**
```typescript
import { useInstantUnstakeRatio, useInstantUnstake, useInstantUnstakeAllowance, useInstantUnstakeApprove } from '@sodax/dapp-kit';

const { data: ratio } = useInstantUnstakeRatio();
const { mutateAsync: instantUnstake } = useInstantUnstake();

const result = await instantUnstake({ spokeProvider, amount, minReceiveAmount, fromChainId });
```

---

## Claim (after cooldown)

After the 7-day cooldown period:

```typescript
const result = await sodax.staking.claim({
  spokeProvider,
  requestId,        // unstake request ID
  fromChainId,
});
```

**React hook:**
```typescript
import { useClaim } from '@sodax/dapp-kit';

const { mutateAsync: claim } = useClaim();
const result = await claim({ spokeProvider, requestId, fromChainId });
```

---

## Cancel Unstake Request

Cancel a pending unstake (before cooldown completes) to get xSODA back:

```typescript
const result = await sodax.staking.cancelUnstake({
  spokeProvider,
  requestId,
  fromChainId,
});
```

**React hook:**
```typescript
import { useCancelUnstake } from '@sodax/dapp-kit';

const { mutateAsync: cancelUnstake } = useCancelUnstake();
```

---

## Query Staking Data

### Staking Info (totals, APR)
```typescript
const stakingInfo = await sodax.staking.getStakingInfo();
// Returns: StakingInfo { totalStaked, totalXSoda, apr, ... }
```

**React hook:**
```typescript
import { useStakingInfo } from '@sodax/dapp-kit';
const { data: info } = useStakingInfo();
```

### Unstaking Info (pending requests)
```typescript
const unstakingInfo = await sodax.staking.getUnstakingInfo(userAddress);
// Returns: UnstakingInfo[] — array of pending unstake requests

// With penalty calculations
const withPenalty = await sodax.staking.getUnstakingInfoWithPenalty(userAddress);
// Returns: UnstakeRequestWithPenalty[] — includes penalty amounts
```

**React hooks:**
```typescript
import { useUnstakingInfo, useUnstakingInfoWithPenalty } from '@sodax/dapp-kit';
const { data: requests } = useUnstakingInfo(userAddress);
const { data: requestsWithPenalty } = useUnstakingInfoWithPenalty(userAddress);
```

### Staking Config (protocol parameters)
```typescript
const config = await sodax.staking.getStakingConfig();
// Returns: StakingConfig { cooldownPeriod, minStakeAmount, ... }
```

**React hook:**
```typescript
import { useStakingConfig } from '@sodax/dapp-kit';
const { data: config } = useStakingConfig();
```

### Conversion Ratios
```typescript
// SODA → xSODA ratio
const stakeRatio = await sodax.staking.getStakeRatio();

// xSODA → SODA ratio (for instant unstake)
const instantRatio = await sodax.staking.getInstantUnstakeRatio();

// Convert amounts
const converted = await sodax.staking.getConvertedAssets(amount, 'SODA_TO_XSODA');
```

**React hooks:**
```typescript
import { useStakeRatio, useInstantUnstakeRatio, useConvertedAssets } from '@sodax/dapp-kit';

const { data: stakeRatio } = useStakeRatio();
const { data: instantRatio } = useInstantUnstakeRatio();
const { data: converted } = useConvertedAssets(amount, direction);
```

---

## Key Constants

- **Cooldown period:** 7 days (604800 seconds)
- **APR:** ~6% (from web app constants)
- **Hub tokens:** SODA at `hubChainConfig.addresses.sodaToken`, xSODA at `hubChainConfig.addresses.xSoda`

## Key Types

```typescript
type StakeParams = { spokeProvider: SpokeProvider; amount: bigint; fromChainId: SpokeChainId };
type UnstakeParams = StakeParams;
type InstantUnstakeParams = StakeParams & { minReceiveAmount: bigint };
type ClaimParams = { spokeProvider: SpokeProvider; requestId: string; fromChainId: SpokeChainId };
type CancelUnstakeParams = ClaimParams;

type StakingInfo = { totalStaked: bigint; totalXSoda: bigint; apr: number; /* ... */ };
type UnstakingInfo = { requestId: string; amount: bigint; claimableAt: number; /* ... */ };
type StakingConfig = { cooldownPeriod: number; minStakeAmount: bigint; /* ... */ };
```

## File Locations

| File | Path |
|------|------|
| StakingService | `packages/sdk/src/staking/StakingService.ts` |
| StakingLogic | `packages/sdk/src/staking/StakingLogic.ts` |
| Staking hooks (19) | `packages/dapp-kit/src/hooks/staking/` |
| Staking docs | `packages/sdk/docs/STAKING.md` |
| Web stake page | `apps/web/app/(apps)/stake/page.tsx` |
| Demo staking page | `apps/demo/src/pages/staking/page.tsx` (667 lines, full example) |
