"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { truncateAddress } from "@/lib/utils";
import { HAS_PRIVY } from "@/lib/config";

/* ─── Privy-powered connect (email + wallet) ──────────────────────── */

function PrivyConnectButton() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usePrivy } = require("@privy-io/react-auth");
  const { login, logout, ready, authenticated, user } = usePrivy();
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  if (isConnected && address) {
    return (
      <div className="relative" ref={containerRef}>
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
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Connected</p>
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
                if (authenticated) logout();
                else disconnect();
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

  return (
    <div className="relative" ref={containerRef}>
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
          <button
            type="button"
            onClick={() => { login(); setShowMenu(false); }}
            disabled={!ready}
            className="mb-2 flex w-full items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            </span>
            <div>
              <span>Sign in with Email</span>
              <p className="text-xs font-normal text-zinc-400">Creates a wallet for you</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => { login({ loginMethods: ["wallet"] }); setShowMenu(false); }}
            disabled={!ready}
            className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
            </span>
            <div>
              <span>External Wallet</span>
              <p className="text-xs font-normal text-zinc-400">MetaMask, Hana, WalletConnect</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Standard wagmi connect (injected wallets only) ──────────────── */

function WagmiConnectButton() {
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  if (isConnected && address) {
    return (
      <div className="relative" ref={containerRef}>
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
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Connected</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {truncateAddress(address, 6)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { disconnect(); setShowMenu(false); }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
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
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              onClick={() => { connect({ connector }); setShowMenu(false); }}
              className="mb-2 flex w-full items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
              </span>
              <div>
                <span>{connector.name}</span>
                <p className="text-xs font-normal text-zinc-400">Browser wallet</p>
              </div>
            </button>
          ))}
          {connectors.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              No wallet detected. Install MetaMask to connect.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Exported ConnectButton — picks the right variant ────────────── */

export function ConnectButton() {
  if (HAS_PRIVY) {
    return <PrivyConnectButton />;
  }
  return <WagmiConnectButton />;
}
