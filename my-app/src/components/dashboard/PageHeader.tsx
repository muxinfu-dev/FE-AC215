// src/components/dashboard/PageHeader.tsx
// 标题 + 日期 + 搜索框
// 搜索框是“受控组件”：显示的值来自父组件（value），输入时通知父组件（onChange）

import { Search, X } from "lucide-react";
import { formatLongDate } from "@/lib/format";

interface PageHeaderProps {
  title: string;
  date: string;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function PageHeader({ title, date, search, onSearchChange }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-slate-500">{formatLongDate(date)}</p>
      </div>

      <div className="relative w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search animals..."
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-9 text-sm outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
        {/* 有输入时才显示清空按钮 */}
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
