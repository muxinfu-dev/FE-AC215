// src/lib/tiers.ts
// 每个分级对应的文字和颜色，集中放在一处
// TierBadge（表格里的小标签）和 TierFilter（上方的筛选按钮）都从这里读

import type { PriorityTier } from "@/types/animal";

interface TierStyle {
  label: string; // 表格标签上的文字
  filterLabel: string; // 筛选按钮上的文字
  className: string; // 颜色
}

// Record<PriorityTier, ...>：TypeScript 会检查三个分级一个都不能少
export const TIER_STYLES: Record<PriorityTier, TierStyle> = {
  attention: {
    label: "Attention Needed",
    filterLabel: "Attention Needed (20+ days est)",
    className: "border-red-200 bg-red-50 text-red-600",
  },
  moderate: {
    label: "Moderate",
    filterLabel: "Moderate (10-20 days est)",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  likely_soon: {
    label: "Likely soon",
    filterLabel: "Likely soon (under 10 days est)",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

// 按钮显示的顺序
export const TIER_ORDER: PriorityTier[] = ["attention", "moderate", "likely_soon"];
