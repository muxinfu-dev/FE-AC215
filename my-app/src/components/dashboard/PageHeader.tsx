// src/components/dashboard/PageHeader.tsx

import { Search } from "lucide-react";
import { formatLongDate } from "@/lib/format";

interface PageHeaderProps {
  title: string;
  date: string;
}

export default function PageHeader({ title, date }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-slate-500">{formatLongDate(date)}</p>
      </div>

      {/* relative + absolute：把放大镜图标“叠”在输入框左侧 */}
      <div className="relative w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search animals..."
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
      </div>
    </div>
  );
}
