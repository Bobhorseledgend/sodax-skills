"use client";

import { ConnectButton } from "@/components/ConnectButton";

export function Header() {
  return (
    <header className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm font-bold text-white">
          S
        </div>
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Sonic Swap
        </span>
      </div>
      <ConnectButton />
    </header>
  );
}
