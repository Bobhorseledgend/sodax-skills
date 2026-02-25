"use client";

import { useState, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { SONIC_MAINNET_CHAIN_ID } from "@sodax/types";
import type { CreateIntentParams } from "@sodax/sdk";
import { TokenSelector } from "@/components/TokenSelector";
import { SlippageSettings } from "@/components/SlippageSettings";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { formatTokenAmount, formatUSD } from "@/lib/utils";

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  coinGeckoId?: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function SwapCard() {
  const { address, isConnected } = useAccount();

  // Token selection
  const [sellToken, setSellToken] = useState<TokenInfo | null>(null);
  const [buyToken, setBuyToken] = useState<TokenInfo | null>(null);
  const [sellAmountStr, setSellAmountStr] = useState("");
  const [slippage, setSlippage] = useState(100); // 1% default (basis points)

  // Parse sell amount to bigint
  const sellAmount = useMemo(() => {
    if (!sellAmountStr || !sellToken) return 0n;
    try {
      return parseUnits(sellAmountStr, sellToken.decimals);
    } catch {
      return 0n;
    }
  }, [sellAmountStr, sellToken]);

  // Get quote
  const {
    data: quoteResult,
    isLoading: quoteLoading,
    isDebouncing,
  } = useSwapQuote({
    sellTokenAddress: sellToken?.address || "",
    buyTokenAddress: buyToken?.address || "",
    amount: sellAmount,
    enabled: isConnected && !!sellToken && !!buyToken && sellAmount > 0n,
  });

  // Extract quoted_amount from Result wrapper
  // useQuote returns Result<SolverIntentQuoteResponse, SolverErrorResponse> | undefined
  // where SolverIntentQuoteResponse = { quoted_amount: bigint }
  const quotedAmount = useMemo((): bigint | null => {
    if (!quoteResult) return null;
    // Unwrap Result type: { ok: true, value: { quoted_amount } } | { ok: false, error }
    if (
      typeof quoteResult === "object" &&
      "ok" in quoteResult &&
      (quoteResult as { ok: boolean }).ok
    ) {
      const value = (
        quoteResult as { ok: true; value: { quoted_amount: bigint | string } }
      ).value;
      // Handle both bigint and string representations
      const raw = value.quoted_amount;
      return typeof raw === "bigint" ? raw : BigInt(String(raw));
    }
    return null;
  }, [quoteResult]);

  // Format quoted buy amount
  const buyAmountStr = useMemo(() => {
    if (!quotedAmount || !buyToken) return "";
    try {
      return formatUnits(quotedAmount, buyToken.decimals);
    } catch {
      return "";
    }
  }, [quotedAmount, buyToken]);

  // Prices
  const { data: sellPrice } = useTokenPrice(
    sellToken?.coinGeckoId,
    sellToken?.symbol || ""
  );
  const { data: buyPrice } = useTokenPrice(
    buyToken?.coinGeckoId,
    buyToken?.symbol || ""
  );

  // Balances
  const tokensForBalance = useMemo(
    () => [sellToken, buyToken].filter(Boolean) as TokenInfo[],
    [sellToken, buyToken]
  );
  const { data: balances } = useTokenBalances(tokensForBalance);
  const sellBalance = sellToken
    ? balances?.[(sellToken.address || ZERO_ADDRESS).toLowerCase()]
    : null;

  // Build CreateIntentParams from current state
  // This feeds into useSwapExecution for approval checking and swap execution
  const intentParams = useMemo((): CreateIntentParams | undefined => {
    if (
      !quotedAmount ||
      !sellToken ||
      !buyToken ||
      !address ||
      sellAmount === 0n
    )
      return undefined;

    // Calculate minOutputAmount with slippage
    // slippage is in basis points: 100 = 1%, so minOutput = quoted * (10000 - slippage) / 10000
    const minOutputAmount =
      (quotedAmount * BigInt(10000 - slippage)) / 10000n;

    // Deadline: 5 minutes from now (as bigint seconds)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

    return {
      inputToken: sellToken.address || ZERO_ADDRESS,
      outputToken: buyToken.address || ZERO_ADDRESS,
      inputAmount: sellAmount,
      minOutputAmount,
      deadline,
      allowPartialFill: false,
      srcChain: SONIC_MAINNET_CHAIN_ID,
      dstChain: SONIC_MAINNET_CHAIN_ID,
      srcAddress: address,
      dstAddress: address,
      solver: ZERO_ADDRESS as `0x${string}`,
      data: "0x" as `0x${string}`,
    };
  }, [quotedAmount, sellToken, buyToken, address, sellAmount, slippage]);

  // Swap execution (pass intentParams for approval checking)
  const { execute, reset, stage, intentHash, txHash, error, isApproving } =
    useSwapExecution(intentParams);

  // Swap direction toggle
  const flipTokens = useCallback(() => {
    const tempSell = sellToken;
    const tempBuy = buyToken;
    setSellToken(tempBuy);
    setBuyToken(tempSell);
    setSellAmountStr(buyAmountStr || "");
  }, [sellToken, buyToken, buyAmountStr]);

  // MAX button handler
  const handleMax = useCallback(() => {
    if (!sellBalance || !sellToken) return;
    const isNative =
      sellToken.address === ZERO_ADDRESS || !sellToken.address;
    let maxAmount = sellBalance.balance;
    // Reserve gas for native token (0.01 S)
    if (isNative) {
      const gasReserve = parseUnits("0.01", sellToken.decimals);
      maxAmount = maxAmount > gasReserve ? maxAmount - gasReserve : 0n;
    }
    setSellAmountStr(formatUnits(maxAmount, sellToken.decimals));
  }, [sellBalance, sellToken]);

  // Execute swap (approve → swap handled inside useSwapExecution)
  const handleSwap = useCallback(async () => {
    if (!intentParams) return;
    try {
      await execute();
    } catch {
      // Error handled in useSwapExecution
    }
  }, [intentParams, execute]);

  // Swap button state machine
  const getButtonState = () => {
    if (!isConnected) return { text: "Connect Wallet", disabled: true };
    if (!sellToken || !buyToken)
      return { text: "Select tokens", disabled: true };
    if (!sellAmountStr || sellAmount === 0n)
      return { text: "Enter an amount", disabled: true };
    if (quoteLoading || isDebouncing)
      return { text: "Fetching quote...", disabled: true, loading: true };
    if (!quotedAmount) return { text: "No liquidity", disabled: true };
    if (sellBalance && sellAmount > sellBalance.balance)
      return { text: "Insufficient balance", disabled: true };
    if (stage === "approving" || isApproving)
      return {
        text: `Approving ${sellToken.symbol}...`,
        disabled: true,
        loading: true,
      };
    if (stage === "swapping")
      return { text: "Swapping...", disabled: true, loading: true };
    if (stage === "error") return { text: "Try Again", disabled: false };
    return { text: "Swap", disabled: false };
  };

  const buttonState = getButtonState();

  // Exchange rate
  const exchangeRate = useMemo(() => {
    if (!sellAmountStr || !buyAmountStr || !sellToken || !buyToken) return null;
    const sellNum = parseFloat(sellAmountStr);
    const buyNum = parseFloat(buyAmountStr);
    if (!sellNum || !buyNum) return null;
    const rate = buyNum / sellNum;
    return `1 ${sellToken.symbol} = ${rate.toFixed(4)} ${buyToken.symbol}`;
  }, [sellAmountStr, buyAmountStr, sellToken, buyToken]);

  // USD values
  const sellUsd =
    sellPrice && sellAmountStr
      ? formatUSD(parseFloat(sellAmountStr) * sellPrice)
      : null;
  const buyUsd =
    buyPrice && buyAmountStr
      ? formatUSD(parseFloat(buyAmountStr) * buyPrice)
      : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Settings row */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Swap
        </span>
        <SlippageSettings slippage={slippage} onChange={setSlippage} />
      </div>

      {/* Sell Section */}
      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            You sell
          </span>
          {sellBalance && sellToken && (
            <button
              type="button"
              onClick={handleMax}
              className="text-xs text-zinc-400 transition-colors hover:text-blue-500 dark:text-zinc-500"
            >
              Balance:{" "}
              {formatTokenAmount(sellBalance.balance, sellToken.decimals)}{" "}
              <span className="font-medium text-blue-500">MAX</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={sellAmountStr}
            onChange={(e) => {
              // Allow only numbers and decimal
              const val = e.target.value.replace(/[^0-9.]/g, "");
              if (val.split(".").length <= 2) {
                setSellAmountStr(val);
                if (stage === "error") reset();
              }
            }}
            className="w-0 flex-1 bg-transparent text-3xl font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
          <TokenSelector
            selectedToken={sellToken}
            onSelect={setSellToken}
            otherToken={buyToken}
            label="Sell token"
          />
        </div>
        {sellUsd && (
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {sellUsd}
          </p>
        )}
      </div>

      {/* Swap Direction Button */}
      <div className="relative z-10 -my-2 flex justify-center">
        <button
          type="button"
          onClick={flipTokens}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-all hover:rotate-180 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
        <div className="flex items-center justify-between gap-2">
          <span
            className={`flex-1 text-3xl font-medium ${
              buyAmountStr
                ? "text-zinc-900 dark:text-zinc-50"
                : "text-zinc-300 dark:text-zinc-600"
            }`}
          >
            {buyAmountStr
              ? parseFloat(buyAmountStr).toFixed(
                  Math.min(buyToken?.decimals || 6, 6)
                )
              : "0"}
          </span>
          <TokenSelector
            selectedToken={buyToken}
            onSelect={setBuyToken}
            otherToken={sellToken}
            label="Buy token"
          />
        </div>
        {buyUsd && (
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {buyUsd}
          </p>
        )}
      </div>

      {/* Exchange Rate + Fees */}
      {exchangeRate && (
        <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/30">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {exchangeRate}
          </p>
        </div>
      )}

      {/* Swap Button */}
      <button
        type="button"
        onClick={buttonState.disabled ? undefined : handleSwap}
        disabled={buttonState.disabled}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
      >
        {buttonState.loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {buttonState.text}
      </button>

      {/* Error message */}
      {error && stage === "error" && (
        <p className="mt-2 text-center text-xs text-red-500">{error}</p>
      )}

      {/* Success message */}
      {intentHash && stage === "success" && (
        <div className="mt-3 rounded-lg bg-green-50 p-3 text-center dark:bg-green-950/30">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Swap submitted!
          </p>
          <a
            href={`https://sonicscan.org/tx/${txHash || intentHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-600 underline hover:text-green-500 dark:text-green-400"
          >
            View on SonicScan
          </a>
        </div>
      )}
    </div>
  );
}
