/**
 * Formatting utilities for analytics display.
 * Handles wei strings, large numbers, percentages.
 */

const RAY = 10n ** 27n;

/**
 * Format a wei string (18 decimals) to a human-readable number string.
 * Returns "—" for invalid inputs.
 */
export function formatWei(
  wei: string | bigint,
  decimals = 18,
  maxFractionDigits = 4
): string {
  try {
    const value = typeof wei === "string" ? BigInt(wei) : wei;
    const divisor = 10n ** BigInt(decimals);
    const whole = value / divisor;
    const fraction = value % divisor;

    if (fraction === 0n) {
      return formatCompact(Number(whole));
    }

    const fractionStr = fraction.toString().padStart(decimals, "0");
    const trimmed = fractionStr.slice(0, maxFractionDigits).replace(/0+$/, "");
    const numStr = trimmed
      ? `${whole}.${trimmed}`
      : whole.toString();

    return formatCompact(parseFloat(numStr));
  } catch {
    return "—";
  }
}

/**
 * Format a number with compact notation for large values.
 * 1234 → "1,234", 1234567 → "1.23M", 1234567890 → "1.23B"
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + "B";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + "M";
  }
  if (value >= 10_000) {
    return (value / 1_000).toFixed(1) + "K";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Convert a ray value (27 decimals) to a percentage string.
 * e.g., 50000000000000000000000000n → "5.00%"
 */
export function rayToPercent(rayValue: string | bigint): string {
  try {
    const value = typeof rayValue === "string" ? BigInt(rayValue) : rayValue;
    // Use BigInt arithmetic first to avoid precision loss (RAY = 10^27 > Number.MAX_SAFE_INTEGER)
    const basisPoints = Number((value * 10000n) / RAY);
    const percent = basisPoints / 100;
    return percent.toFixed(2) + "%";
  } catch {
    return "—";
  }
}

/**
 * Format a percentage number with specified decimal places.
 */
export function formatPercent(value: number, decimals = 1): string {
  return value.toFixed(decimals) + "%";
}

/**
 * Format a date from a Unix timestamp (seconds).
 */
export function formatTimestamp(seconds: number | string): string {
  try {
    const ts = typeof seconds === "string" ? Number(seconds) : seconds;
    return new Date(ts * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
