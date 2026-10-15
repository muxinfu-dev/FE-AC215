// src/components/dashboard/AnimalTable.tsx
// 动物表格 + 分页（排序、筛选、翻页在第 7 步加）

import type { ReactNode } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Funnel } from "lucide-react";
import type { Animal } from "@/types/animal";
import { formatBreedAge } from "@/lib/format";
import AnimalPhoto from "@/components/common/AnimalPhoto";
import TierBadge from "@/components/dashboard/TierBadge";

interface AnimalTableProps {
  animals: Animal[]; // 当前页要显示的行
  totalCount: number; // 总数，用于 "Showing 1-6 of 18"
  page: number; // 当前页，从 1 开始
  pageSize: number;
  selectedId: string | null;
}

export default function AnimalTable({
  animals,
  totalCount,
  page,
  pageSize,
  selectedId,
}: AnimalTableProps) {
  const start = (page - 1) * pageSize + 1;
  const end = start + animals.length - 1;
  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <HeaderCell label="Animal Name" icon="sort" />
            <HeaderCell label="Breed & Age" icon="filter" />
            <HeaderCell label="Days in Shelter" icon="sort" />
            <HeaderCell label="Est. Remaining Stay" icon="sort" />
            <HeaderCell label="Priority Tier" icon="sort" />
          </tr>
        </thead>

        <tbody>
          {animals.map((animal) => (
            <AnimalRow
              key={animal.id}
              animal={animal}
              selected={animal.id === selectedId}
            />
          ))}
        </tbody>
      </table>

      {/* 分页栏 */}
      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
        <span>
          Showing {start}-{end} of {totalCount} animals
        </span>
        <div className="flex items-center gap-2">
          <PageButton>
            <ChevronLeft className="size-4" />
          </PageButton>
          {/* Array.from 生成 [1, 2, 3]，相当于 Python 的 range(1, pageCount + 1) */}
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <PageButton key={n} active={n === page}>
              {n}
            </PageButton>
          ))}
          <PageButton>
            <ChevronRight className="size-4" />
          </PageButton>
        </div>
      </div>
    </div>
  );
}

// ---------- 子组件 ----------

function HeaderCell({ label, icon }: { label: string; icon: "sort" | "filter" }) {
  const Icon = icon === "sort" ? ArrowUpDown : Funnel;
  return (
    <th className="px-6 py-3 font-medium">
      <span className="inline-flex items-center gap-1.5">
        {label}
        <Icon className="size-3.5" />
      </span>
    </th>
  );
}

function AnimalRow({ animal, selected }: { animal: Animal; selected: boolean }) {
  return (
    <tr
      className={
        "cursor-pointer border-t border-slate-100 transition-colors " +
        (selected ? "bg-teal-50" : "hover:bg-slate-50")
      }
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <AnimalPhoto
            src={animal.photoUrl}
            name={animal.name}
            className="size-11 shrink-0 rounded-lg"
          />
          <div>
            <div className="font-semibold text-slate-900">{animal.name}</div>
            <div className="text-xs text-slate-400">ID: #{animal.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600">{formatBreedAge(animal)}</td>
      <td className="px-6 py-4 text-slate-600">{animal.daysInShelter} days</td>
      <td
        className={
          "px-6 py-4 " + (selected ? "font-semibold text-teal-700" : "text-slate-600")
        }
      >
        ~{animal.estimatedRemainingDays} days
      </td>
      <td className="px-6 py-4">
        <TierBadge tier={animal.priorityTier} />
      </td>
    </tr>
  );
}

// children：包在组件标签中间的内容（这里是数字或箭头图标）
function PageButton({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <button
      className={
        "flex size-9 items-center justify-center rounded-lg border text-sm transition " +
        (active
          ? "border-teal-300 bg-teal-50 font-medium text-teal-700"
          : "border-slate-200 text-slate-600 hover:bg-slate-50")
      }
    >
      {children}
    </button>
  );
}
