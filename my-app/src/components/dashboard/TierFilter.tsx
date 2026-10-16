// src/components/dashboard/TierFilter.tsx
// 三个分级筛选按钮：点击筛选，再点一次取消

import type { PriorityTier } from "@/types/animal";
import { TIER_ORDER, TIER_STYLES } from "@/lib/tiers";

interface TierFilterProps {
  active: PriorityTier | null;
  onSelect: (tier: PriorityTier) => void;
}

export default function TierFilter({ active, onSelect }: TierFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {TIER_ORDER.map((tier) => {
        const isActive = active === tier;
        // 有一个被选中时，其他按钮变淡
        const isDimmed = active !== null && !isActive;
        return (
          <button
            key={tier}
            onClick={() => onSelect(tier)}
            aria-pressed={isActive}
            className={
              "rounded-lg border px-4 py-2 text-sm font-medium transition " +
              TIER_STYLES[tier].className +
              (isActive ? " ring-2 ring-current ring-offset-1" : "") +
              (isDimmed ? " opacity-50 hover:opacity-80" : " hover:brightness-95")
            }
          >
            {TIER_STYLES[tier].filterLabel}
          </button>
        );
      })}
    </div>
  );
}
