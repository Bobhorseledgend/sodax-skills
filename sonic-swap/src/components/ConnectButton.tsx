"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useDisconnect } from "wagmi";
import { truncateAddress } from "@/lib/utils";

/**
 * ConnectButton — unified wallet connection.
 *
 * Two paths:
 * 1. External wallet (MetaMask, etc.) — via wagmi connectors injected by Privy
 * 2. Email sign-in — via Privy login() which creates an embedded wallet
 *
 * Both paths result in a wagmi-connected wallet that feeds into SODAX hooks.
 */
export function ConnectButton() {
  const [showMenu, setShowMenu] = useState(false);
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Connected state — show address + disconnect
  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {truncateAddress(address)}
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-2 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Connected
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {truncateAddress(address, 6)}
              </p>
              {user?.email?.address && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {user.email.address}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (authenticated) {
                  logout();
                } else {
                  disconnect();
                }
                setShowMenu(false);
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // Not connected — show connect options
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
      >
        Connect
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Connect Wallet
          </p>

          {/* Email Sign-in via Privy */}
          <button
            type="button"
            onClick={() => {
              login();
              setShowMenu(false);
            }}
            disabled={!ready}
            className="mb-2 flex w-full items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <div>
              <span>Sign in with Email</span>
              <p className="text-xs font-normal text-zinc-400">
                Creates a wallet for you
              </p>
            </div>
          </button>

          {/* External Wallet (MetaMask, etc.) */}
          <button
            type="button"
            onClick={() => {
              login({ loginMethods: ["wallet"] });
              setShowMenu(false);
            }}
            disabled={!ready}
            className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
            </span>
            <div>
              <span>External Wallet</span>
              <p className="text-xs font-normal text-zinc-400">
                MetaMask, Hana, WalletConnect
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
