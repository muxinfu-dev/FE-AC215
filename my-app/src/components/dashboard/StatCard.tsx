// src/components/dashboard/StatCard.tsx
// 一张数字卡片。同一个组件，传入不同的 icon / label / value 就变成 4 张不同的卡

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
}

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {/* h-10 固定标题区高度：标签有的一行有的两行，这样数字仍然对齐 */}
      <div className="flex h-10 items-start gap-2 text-sm text-slate-500">
        <Icon className="mt-0.5 size-4 shrink-0" />
        <span className="leading-snug">{label}</span>
      </div>
      <div className="mt-3 text-4xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
