// src/components/dashboard/TierFilter.tsx
// 三个分级筛选按钮（点击筛选第 7 步再做）

import { TIER_ORDER, TIER_STYLES } from "@/lib/tiers";

export default function TierFilter() {
  return (
    <div className="flex flex-wrap gap-3">
      {TIER_ORDER.map((tier) => (
        <button
          key={tier}
          className={
            "rounded-lg border px-4 py-2 text-sm font-medium transition hover:brightness-95 " +
            TIER_STYLES[tier].className
          }
        >
          {TIER_STYLES[tier].filterLabel}
        </button>
      ))}
    </div>
  );
}
