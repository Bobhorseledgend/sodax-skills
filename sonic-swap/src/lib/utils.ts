/**
 * Truncate an Ethereum address for display.
 * "0x1234567890abcdef..." → "0x1234...cdef"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a token amount from bigint to human-readable string.
 * Uses viem's formatUnits under the hood.
 */
export function formatTokenAmount(
  amount: bigint | string,
  decimals: number,
  maxDecimals = 6
): string {
  const value =
    typeof amount === "string" ? BigInt(amount) : amount;
  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = value % divisor;

  if (fraction === 0n) return whole.toString();

  const fractionStr = fraction.toString().padStart(decimals, "0");
  const trimmed = fractionStr.slice(0, maxDecimals).replace(/0+$/, "");

  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}

/**
 * Format a USD value with $ prefix and 2 decimal places.
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
