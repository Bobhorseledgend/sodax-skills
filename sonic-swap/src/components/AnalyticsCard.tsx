"use client";

interface AnalyticsCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

/**
 * Reusable stat card for the analytics dashboard.
 * Shows a metric label, value, optional sub-value, and trend indicator.
 */
export function AnalyticsCard({
  label,
  value,
  subValue,
  icon,
  trend,
}: AnalyticsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {label}
        </span>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {(subValue || trend) && (
        <div className="mt-1 flex items-center gap-1">
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-zinc-400"
              }`}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
            </span>
          )}
          {subValue && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {subValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
