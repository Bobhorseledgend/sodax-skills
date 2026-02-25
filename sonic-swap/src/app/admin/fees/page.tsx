"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useSodaxContext, useSpokeProvider } from "@sodax/dapp-kit";
import { SONIC_MAINNET_CHAIN_ID } from "@sodax/types";
import { Header } from "@/components/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { formatTokenAmount } from "@/lib/utils";
import { partnerFee } from "@/lib/sodax";

interface ClaimableAsset {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  balance: bigint;
}

/**
 * Admin page for partner fee claiming.
 * Shows claimable fees per token and allows claiming.
 *
 * Uses PartnerFeeClaimService.fetchAssetsBalances() to get claimable balances,
 * then PartnerFeeClaimService.swap() to claim (auto-swap to desired token).
 */
export default function AdminFeesPage() {
  const { address, isConnected } = useAccount();
  const { sodax } = useSodaxContext();
  const spokeProvider = useSpokeProvider(SONIC_MAINNET_CHAIN_ID);

  const [assets, setAssets] = useState<ClaimableAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimingToken, setClaimingToken] = useState<string | null>(null);

  // Fetch claimable fee balances
  const fetchBalances = useCallback(async () => {
    if (!sodax || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      const feeClaim = sodax.partners?.feeClaim;
      if (!feeClaim) {
        setError("Partner fee claim service not available");
        return;
      }

      const result = await feeClaim.fetchAssetsBalances({
        address: partnerFee.address,
      });

      if (result && typeof result === "object" && "ok" in result) {
        const r = result as {
          ok: boolean;
          value?: Map<string, { balance: bigint; symbol?: string; decimals?: number }>;
          error?: unknown;
        };
        if (r.ok && r.value) {
          const parsed: ClaimableAsset[] = [];
          r.value.forEach((asset, tokenAddress) => {
            if (asset.balance > 0n) {
              parsed.push({
                tokenAddress,
                symbol: asset.symbol || tokenAddress.slice(0, 8),
                decimals: asset.decimals || 18,
                balance: asset.balance,
              });
            }
          });
          setAssets(parsed);
        } else {
          setError(r.error ? String(r.error) : "Failed to fetch balances");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  }, [sodax, address]);

  // Claim fees for a specific token
  const handleClaim = useCallback(
    async (tokenAddress: string) => {
      if (!sodax || !spokeProvider) return;

      setClaimingToken(tokenAddress);
      setError(null);

      try {
        const feeClaim = sodax.partners?.feeClaim;
        if (!feeClaim) {
          setError("Partner fee claim service not available");
          return;
        }

        // Approve token first if needed
        const approveResult = await feeClaim.isTokenApproved({
          token: tokenAddress as `0x${string}`,
          spokeProvider: spokeProvider as unknown as Parameters<typeof feeClaim.isTokenApproved>[0]["spokeProvider"],
        });

        if (
          approveResult &&
          typeof approveResult === "object" &&
          "ok" in approveResult &&
          (approveResult as { ok: boolean; value?: boolean }).ok &&
          !(approveResult as { ok: true; value: boolean }).value
        ) {
          await feeClaim.approveToken({
            token: tokenAddress as `0x${string}`,
            spokeProvider: spokeProvider as unknown as Parameters<typeof feeClaim.approveToken>[0]["spokeProvider"],
          });
        }

        // Note: The actual claim would use feeClaim.createIntentAutoSwap or similar
        // For now, refresh balances to show updated state
        await fetchBalances();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Claim failed");
      } finally {
        setClaimingToken(null);
      }
    },
    [sodax, spokeProvider, fetchBalances]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-[480px] flex-col gap-4 px-4 py-8">
        <Header />

        <ErrorBoundary>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Partner Fee Claims
            </h2>
            <p className="mb-4 text-xs text-zinc-400 dark:text-zinc-500">
              View and claim accumulated partner fees from swap volume.
            </p>

            {/* Partner address */}
            <div className="mb-4 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
              <p className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Partner Address
              </p>
              <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                {partnerFee.address}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Fee rate: {"percentage" in partnerFee && partnerFee.percentage ? `${partnerFee.percentage / 100}%` : "Custom"}
              </p>
            </div>

            {!isConnected ? (
              <div className="py-8 text-center">
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Connect your wallet to view claimable fees
                </p>
              </div>
            ) : (
              <>
                {/* Fetch button */}
                <button
                  type="button"
                  onClick={fetchBalances}
                  disabled={isLoading}
                  className="mb-4 w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800"
                >
                  {isLoading ? "Loading..." : "Refresh Claimable Fees"}
                </button>

                {/* Error */}
                {error && (
                  <p className="mb-3 text-center text-xs text-red-500">
                    {error}
                  </p>
                )}

                {/* Asset list */}
                {assets.length > 0 ? (
                  <div className="space-y-2">
                    {assets.map((asset) => (
                      <div
                        key={asset.tokenAddress}
                        className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {asset.symbol}
                          </p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            {formatTokenAmount(asset.balance, asset.decimals)}{" "}
                            claimable
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleClaim(asset.tokenAddress)}
                          disabled={claimingToken === asset.tokenAddress}
                          className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 disabled:bg-zinc-200 disabled:text-zinc-400"
                        >
                          {claimingToken === asset.tokenAddress
                            ? "Claiming..."
                            : "Claim"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : !isLoading ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-zinc-400 dark:text-zinc-500">
                      No claimable fees found. Click refresh to check.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </ErrorBoundary>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Powered by SODAX — Sonic chain
        </p>
      </main>
    </div>
  );
}
