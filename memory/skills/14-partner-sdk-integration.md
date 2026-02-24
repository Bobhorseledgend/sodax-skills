# Skill 14: Partner SDK Integration

## Quick Reference

**SDK:** `sodax.partners` (PartnerService + PartnerFeeClaimService)
**Docs:** `packages/sdk/docs/MONETIZE_SDK.md`
**Demo:** `apps/demo/src/pages/partner-fee-claim/page.tsx`

---

## Fee Configuration

### Global (recommended)

```typescript
import { Sodax, type PartnerFee } from '@sodax/sdk';

// Percentage-based: 100 = 1%, 10000 = 100%
const fee: PartnerFee = {
  address: '0xYourSonicAddress',  // EVM (Sonic hub) address to receive fees
  percentage: 100,                // 1%
};

// Amount-based (fixed fee in token precision)
const fixedFee: PartnerFee = {
  address: '0xYourSonicAddress',
  amount: 1000n,  // fixed amount per tx
};

// Apply to swaps
const sodax = new Sodax({ swap: { partnerFee: fee } });

// Apply to money market
const sodax2 = new Sodax({ moneyMarket: { partnerFee: fee } });

// Apply to both
const sodax3 = new Sodax({
  swap: { partnerFee: fee },
  moneyMarket: { partnerFee: fee },
});
```

### Per-Request Override

```typescript
// Quote with custom fee
const quote = await sodax.swaps.getQuote({
  token_src: '0x...',
  token_dst: '0x...',
  token_src_blockchain_id: BSC_MAINNET_CHAIN_ID,
  token_dst_blockchain_id: ARBITRUM_MAINNET_CHAIN_ID,
  amount: 1000000000000000n,
  quote_type: 'exact_input',
  fee: customFee,  // overrides global fee
});

// Swap with custom fee
const result = await sodax.swaps.swap({
  intentParams: { /* ... */ },
  spokeProvider,
  fee: customFee,  // overrides global fee
});
```

---

## Fee Claiming

### SDK

```typescript
// PartnerService is auto-initialized
const partners = sodax.partners;

// Claim accumulated fees
const result = await partners.claimFees({
  partnerAddress: '0xYourAddress',
  tokenAddress: '0xTokenToClaimFees',
  spokeProvider: sonicSpokeProvider,
});

if (result.ok) {
  console.log('Claimed:', result.value);
}
```

### PartnerFeeClaimService (lower-level)

```typescript
import { PartnerFeeClaimService } from '@sodax/sdk';

const feeClaimService = new PartnerFeeClaimService({
  protocolIntentsContract: '0x...',  // protocol intents contract on hub
  configService: sodax.config,
  hubProvider: sodax.hubProvider,
});

// Get claimable fees
const claimable = await feeClaimService.getClaimableFees(partnerAddress, tokenAddress);

// Claim fees
const tx = await feeClaimService.claimFees(partnerAddress, tokenAddress, spokeProvider);
```

---

## Co-branded Partner Portal (apps/web)

The web app supports partner pages at `/partner` and `/partners/*`:

```
apps/web/app/(apps)/partner/page.tsx     — Partner swap portal
apps/web/app/partners/sodax-sdk/         — SDK partner landing
apps/web/app/partners/amped-finance/     — Amped Finance partner page
apps/web/app/partners/hana/              — Hana partner page
apps/web/app/partners/lightlink-network/ — LightLink partner page
```

**Partner layout differences:** The `(apps)/layout.tsx` detects partner pages and applies different sizing/branding.

---

## Key Types

```typescript
type PartnerFee = {
  address: string;                    // Sonic hub address to receive fees
  percentage?: number;                // 100 = 1%, 10000 = 100%
  amount?: bigint;                    // fixed amount in token decimals
};

type PartnerServiceConfig = {
  feeClaim?: { protocolIntentsContract: Address };
};
```

---

## File Locations

| File | Path |
|------|------|
| PartnerService | `packages/sdk/src/partner/PartnerService.ts` |
| PartnerFeeClaimService | `packages/sdk/src/partner/PartnerFeeClaimService.ts` |
| Docs | `packages/sdk/docs/MONETIZE_SDK.md` |
| Demo page | `apps/demo/src/pages/partner-fee-claim/page.tsx` |
| Web partner routes | `apps/web/app/(apps)/partner/`, `apps/web/app/partners/` |
