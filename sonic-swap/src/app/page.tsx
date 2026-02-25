export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-[480px] flex-col gap-4 px-4 py-8">
        {/* Header — F3 will add ConnectButton here */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Sonic Swap
          </h1>
          <div className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Connect Wallet
          </div>
        </div>

        {/* Swap Card Shell — F4/F5 will build the real swap interface */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Sell Section */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
              You sell
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-medium text-zinc-900 dark:text-zinc-50">
                0
              </span>
              <div className="rounded-full bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                Select token
              </div>
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
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
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Buy Section */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
              You buy
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-medium text-zinc-400 dark:text-zinc-600">
                0
              </span>
              <div className="rounded-full bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                Select token
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            className="mt-4 w-full rounded-2xl bg-blue-500 py-4 text-center text-base font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
            disabled
          >
            Connect Wallet
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Powered by SODAX — Sonic chain
        </p>
      </main>
    </div>
  );
}
