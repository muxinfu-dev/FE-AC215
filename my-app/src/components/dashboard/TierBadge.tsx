// src/components/dashboard/TierBadge.tsx
// 表格里的分级小标签：根据 tier 决定文字和颜色

import type { PriorityTier } from "@/types/animal";
import { TIER_STYLES } from "@/lib/tiers";

export default function TierBadge({ tier }: { tier: PriorityTier }) {
  const style = TIER_STYLES[tier];
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " +
        style.className
      }
    >
      {style.label}
    </span>
  );
}
