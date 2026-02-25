"use client";

import { useState, useMemo } from "react";
import { useSonicTokens } from "@/hooks/useSonicTokens";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { formatTokenAmount } from "@/lib/utils";

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  coinGeckoId?: string;
}

interface TokenSelectorProps {
  selectedToken: TokenInfo | null;
  onSelect: (token: TokenInfo) => void;
  otherToken: TokenInfo | null; // the other side of the swap (to exclude)
  label?: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function TokenSelector({
  selectedToken,
  onSelect,
  otherToken,
  label,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: tokens, isLoading: tokensLoading } = useSonicTokens();
  const { data: balances } = useTokenBalances(tokens as TokenInfo[]);

  // Filter tokens by search term and exclude the other selected token
  const filteredTokens = useMemo(() => {
    if (!tokens) return [];
    const query = search.toLowerCase();
    return tokens
      .filter((t: TokenInfo) => {
        // Exclude the token selected on the other side
        if (
          otherToken &&
          t.address.toLowerCase() === otherToken.address.toLowerCase()
        ) {
          return false;
        }
        // Search filter
        if (!query) return true;
        return (
          t.symbol.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query)
        );
      })
      .sort((a: TokenInfo, b: TokenInfo) => {
        // Sort tokens with balance first
        const aBalance =
          balances?.[
            (a.address || ZERO_ADDRESS).toLowerCase()
          ]?.balance ?? 0n;
        const bBalance =
          balances?.[
            (b.address || ZERO_ADDRESS).toLowerCase()
          ]?.balance ?? 0n;
        if (aBalance > 0n && bBalance === 0n) return -1;
        if (bBalance > 0n && aBalance === 0n) return 1;
        return 0;
      });
  }, [tokens, search, otherToken, balances]);

  return (
    <>
      {/* Token Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        {selectedToken ? (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-300 text-[10px] font-bold dark:bg-zinc-600">
              {selectedToken.symbol.charAt(0)}
            </span>
            {selectedToken.symbol}
          </>
        ) : (
          "Select token"
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Token Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {label || "Select a token"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearch("");
                }}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 pb-2">
              <input
                type="text"
                placeholder="Search by name or symbol"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                autoFocus
              />
            </div>

            {/* Token List */}
            <div className="max-h-[360px] overflow-y-auto px-2 pb-2">
              {tokensLoading ? (
                <div className="flex flex-col gap-2 p-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
                    />
                  ))}
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-400">
                  No tokens found
                </div>
              ) : (
                filteredTokens.map((token: TokenInfo) => {
                  const addr = (token.address || ZERO_ADDRESS).toLowerCase();
                  const balance = balances?.[addr];
                  const isSelected =
                    selectedToken?.address.toLowerCase() ===
                    token.address.toLowerCase();

                  return (
                    <button
                      key={token.address || ZERO_ADDRESS}
                      type="button"
                      onClick={() => {
                        onSelect(token);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {token.symbol}
                          </p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            {token.name}
                          </p>
                        </div>
                      </div>

                      {balance && balance.balance > 0n && (
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {formatTokenAmount(
                            balance.balance,
                            token.decimals
                          )}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
