# Skill 10: Token Price & Balance Queries

## Quick Reference

**Price service:** `apps/web/services/price.ts` (CoinGecko wrapper)
**Balance hook:** `apps/web/hooks/useAllChainBalances.ts`
**Price hooks:** `apps/web/hooks/useTokenPrice.ts`, `useAllTokenPrices.ts`

---

## Price Service (apps/web only)

```typescript
import { getTokenPrice, calculateUSDValue, getCachedTokenPrice, isTokenSupported } from '@/services/price';

// Get USD price for a token
const price = await getTokenPrice(token); // XToken → number

// Calculate USD value for an amount
const usd = await calculateUSDValue(token, '1.5'); // XToken, string → number

// Cached version (1-min TTL in-memory)
const cachedPrice = await getCachedTokenPrice(token);

// Check if token is supported
const supported = isTokenSupported('ETH'); // boolean
```

**Stablecoins** (USDC, USDT, bnUSD) always return `$1` without API call.

**API:** CoinGecko wrapper at `https://coingecko-wrapper-cyan.vercel.app/api/price?id={id}&vs_currencies=usd`

**Supported tokens (80+):** ETH, WETH, weETH, wstETH, BTC, WBTC, cbBTC, tBTC, BTCB, SOL, BNB, AVAX, SUI, INJ, ICX, XLM, POL, S (Sonic), SODA, HYPE, LL, RBNT, KAIA, afSUI, haSUI, vSUI, mSUI, and their `r` (receipt) variants, plus LightLink wrapped variants (`*.LL`).

**Token → CoinGecko ID mapping:** hardcoded in `TOKEN_TO_COINGECKO_ID` in `apps/web/services/price.ts`.

---

## Multi-chain Balances (apps/web hook)

```typescript
import { useAllChainBalances, type ChainBalanceEntry } from '@/hooks/useAllChainBalances';

// Get all token balances across all connected chains
const balances = useAllChainBalances();
// Returns: Record<tokenAddress, ChainBalanceEntry[]>

// SODA tokens only (for staking page)
const sodaBalances = useAllChainBalances({ onlySodaTokens: true });

// Each entry:
type ChainBalanceEntry = {
  balance: bigint;          // raw balance in smallest unit
  chainId: SpokeChainId;   // which chain
  token: XToken;            // full token info
};
```

**Behaviour:**
- Fetches balances for all `availableChains` in parallel
- Uses `xService.getBalances()` per chain type
- 5-second refetch interval
- Returns `{}` when no wallet connected
- Keeps previous data during refetch (`keepPreviousData`)

---

## Single Token Price Hook (apps/web)

```typescript
import { useTokenPrice } from '@/hooks/useTokenPrice';

const { data: price, isLoading } = useTokenPrice(token);
// token: XToken → price: number (USD)
```

React Query config: 1-min staleTime, 5-min gcTime.

---

## Batch Token Prices Hook (apps/web)

```typescript
import { useAllTokenPrices } from '@/hooks/useAllTokenPrices';

const { data: prices } = useAllTokenPrices(tokens);
// tokens: XToken[] → prices: Record<string, number>
// Key is `${symbol}-${chainId}`
```

---

## APY/Liquidity Hook (apps/web)

```typescript
import { useLiquidity } from '@/hooks/useAPY'; // exported as useLiquidity

const apy = useLiquidity(hubAssetAddress);
// Returns: string (formatted percentage, e.g. "5.23%")
```

Uses reserve data from money market to calculate APY.

---

## xSODA Balances Hook (apps/web)

```typescript
import { useAllChainXSodaBalances } from '@/hooks/useAllChainXSodaBalances';

const xSodaBalances = useAllChainXSodaBalances();
// Returns: Record<chainId, bigint> for xSODA token
```

---

## File Locations

| File | Path |
|------|------|
| Price service | `apps/web/services/price.ts` |
| useAllChainBalances | `apps/web/hooks/useAllChainBalances.ts` |
| useTokenPrice | `apps/web/hooks/useTokenPrice.ts` |
| useAllTokenPrices | `apps/web/hooks/useAllTokenPrices.ts` |
| useAPY (useLiquidity) | `apps/web/hooks/useAPY.ts` |
| useAllChainXSodaBalances | `apps/web/hooks/useAllChainXSodaBalances.ts` |
| useTokenSupplyBalances | `apps/web/hooks/useTokenSupplyBalances.ts` |
| useTokenWalletBalances | `apps/web/hooks/useTokenWalletBalances.ts` |
