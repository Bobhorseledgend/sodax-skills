const COINGECKO_API =
  "https://coingecko-wrapper-cyan.vercel.app/api/price";

/** Stablecoins always return $1 — no API call needed */
const STABLECOIN_SYMBOLS = new Set(["USDC", "USDT", "bnUSD", "DAI"]);

/** In-memory price cache with 1-min TTL */
const priceCache = new Map<string, { price: number; expiresAt: number }>();
const CACHE_TTL = 60_000; // 1 minute

/**
 * Get USD price for a token via CoinGecko wrapper.
 * Stablecoins return $1 instantly. Others hit the API with caching.
 */
export async function getTokenPrice(
  coinGeckoId: string | undefined,
  symbol: string
): Promise<number | null> {
  // Stablecoins — instant $1
  if (STABLECOIN_SYMBOLS.has(symbol)) return 1;

  // No CoinGecko ID — can't fetch price
  if (!coinGeckoId) return null;

  // Check cache
  const cached = priceCache.get(coinGeckoId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.price;
  }

  try {
    const res = await fetch(
      `${COINGECKO_API}?id=${coinGeckoId}&vs_currencies=usd`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const price = data?.[coinGeckoId]?.usd ?? null;

    if (price !== null) {
      priceCache.set(coinGeckoId, {
        price,
        expiresAt: Date.now() + CACHE_TTL,
      });
    }

    return price;
  } catch {
    return null;
  }
}

/**
 * Calculate USD value of a token amount.
 */
export function calculateUsdValue(
  amount: number,
  priceUsd: number | null
): number | null {
  if (priceUsd === null || isNaN(amount)) return null;
  return amount * priceUsd;
}
