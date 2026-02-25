"use client";

import { useState } from "react";

const PRESETS = [
  { label: "0.5%", value: 50 },
  { label: "1%", value: 100 },
  { label: "3%", value: 300 },
];

interface SlippageSettingsProps {
  slippage: number; // basis points
  onChange: (slippage: number) => void;
}

export function SlippageSettings({ slippage, onChange }: SlippageSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const isCustom = !PRESETS.some((p) => p.value === slippage);
  const displayValue = (slippage / 100).toFixed(1);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {displayValue}% slippage
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Max slippage
          </p>
          <div className="flex gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  onChange(preset.value);
                  setCustomValue("");
                }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  slippage === preset.value
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <div className="flex flex-1 items-center">
              <input
                type="text"
                placeholder="Custom"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
                    onChange(Math.round(parsed * 100));
                  }
                }}
                className={`w-full rounded-lg border py-1.5 text-center text-xs ${
                  isCustom
                    ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                } text-zinc-700 dark:text-zinc-300`}
              />
            </div>
          </div>
          {slippage > 500 && (
            <p className="mt-2 text-xs text-orange-500">
              High slippage — you may receive less tokens
            </p>
          )}
        </div>
      )}
    </div>
  );
}
