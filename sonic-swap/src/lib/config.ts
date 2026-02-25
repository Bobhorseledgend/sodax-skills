/**
 * App-wide configuration constants.
 * This file must NOT import any browser-only modules (wallet-sdk, privy, etc.)
 * because it's used in components that may be evaluated during SSR.
 */

/**
 * Privy availability check.
 * When NEXT_PUBLIC_PRIVY_APP_ID is not set (or is the placeholder),
 * the app runs without Privy — wallet connection via MetaMask/injected only.
 */
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const HAS_PRIVY =
  !!PRIVY_APP_ID &&
  PRIVY_APP_ID !== "placeholder-app-id" &&
  PRIVY_APP_ID.length > 5;

export { PRIVY_APP_ID };
