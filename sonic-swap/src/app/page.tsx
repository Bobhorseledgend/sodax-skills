"use client";

import { Header } from "@/components/Header";
import { SwapCard } from "@/components/SwapCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-[480px] flex-col gap-4 px-4 py-8">
        <Header />
        <ErrorBoundary>
          <SwapCard />
        </ErrorBoundary>
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Powered by SODAX — Sonic chain
        </p>
      </main>
    </div>
  );
}
