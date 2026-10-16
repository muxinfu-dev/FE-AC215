// src/components/dashboard/AnimalTable.tsx
// 动物表格：点击行选中、点表头排序、Breed & Age 筛选、分页
// 自己不存任何数据状态，全部通过 props 从 DashboardPage 拿，操作时调用 onXxx 通知上层

import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Funnel,
} from "lucide-react";
import type { AgeGroup, Animal, Species } from "@/types/animal";
import type { BreedAgeFilter, SortKey, SortState } from "@/lib/animalQuery";
import { formatBreedAge } from "@/lib/format";
import AnimalPhoto from "@/components/common/AnimalPhoto";
import TierBadge from "@/components/dashboard/TierBadge";

interface AnimalTableProps {
  animals: Animal[];
  totalCount: number;
  page: number;
  pageCount: number;
  pageSize: number;
  selectedId: string | null;
  sort: SortState | null;
  breedAge: BreedAgeFilter;
  onRowClick: (id: string) => void;
  onSort: (key: SortKey) => void;
  onBreedAgeChange: (next: BreedAgeFilter) => void;
  onPageChange: (page: number) => void;
}

export default function AnimalTable(props: AnimalTableProps) {
  const { animals, totalCount, page, pageCount, pageSize, selectedId, sort } = props;

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = (page - 1) * pageSize + animals.length;

  return (
    // 不用 overflow-hidden，否则筛选弹出框会被裁掉；圆角改由首尾表头单元格自己做
    <div className="rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="text-slate-500 [&_th]:bg-slate-50 [&_th:first-child]:rounded-tl-xl [&_th:last-child]:rounded-tr-xl">
          <tr>
            <SortHeader label="Animal Name" sortKey="name" sort={sort} onSort={props.onSort} />
            <th className="px-6 py-3 font-medium">
              <BreedAgeFilterMenu value={props.breedAge} onChange={props.onBreedAgeChange} />
            </th>
            <SortHeader label="Days in Shelter" sortKey="daysInShelter" sort={sort} onSort={props.onSort} />
            <SortHeader
              label="Est. Remaining Stay"
              sortKey="estimatedRemainingDays"
              sort={sort}
              onSort={props.onSort}
            />
            <SortHeader label="Priority Tier" sortKey="priorityTier" sort={sort} onSort={props.onSort} />
          </tr>
        </thead>

        <tbody>
          {animals.map((animal) => (
            <AnimalRow
              key={animal.id}
              animal={animal}
              selected={animal.id === selectedId}
              onClick={() => props.onRowClick(animal.id)}
            />
          ))}

          {/* 空状态：筛选或搜索后没有结果 */}
          {animals.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                No animals match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
        <span>
          Showing {start}-{end} of {totalCount} animals
        </span>
        <div className="flex items-center gap-2">
          <PageButton
            disabled={page <= 1}
            onClick={() => props.onPageChange(page - 1)}
            label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </PageButton>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <PageButton key={n} active={n === page} onClick={() => props.onPageChange(n)}>
              {n}
            </PageButton>
          ))}
          <PageButton
            disabled={page >= pageCount}
            onClick={() => props.onPageChange(page + 1)}
            label="Next page"
          >
            <ChevronRight className="size-4" />
          </PageButton>
        </div>
      </div>
    </div>
  );
}

// ---------- 可排序的表头 ----------

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  sort: SortState | null;
  onSort: (key: SortKey) => void;
}

function SortHeader({ label, sortKey, sort, onSort }: SortHeaderProps) {
  const isActive = sort?.key === sortKey;
  // 当前排序的列显示 ↑ 或 ↓，其他列显示 ⇅
  const Icon = !isActive ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <th className="px-6 py-3 font-medium" aria-sort={isActive ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        onClick={() => onSort(sortKey)}
        className={
          "inline-flex items-center gap-1.5 hover:text-slate-900 " +
          (isActive ? "text-teal-700" : "")
        }
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </th>
  );
}

// ---------- Breed & Age 筛选菜单 ----------

const SPECIES_OPTIONS: Species[] = ["Dog", "Cat"];
const AGE_OPTIONS: AgeGroup[] = ["Puppy", "Kitten", "Young", "Adult", "Senior"];

// 在数组里有就去掉，没有就加上
function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function BreedAgeFilterMenu({
  value,
  onChange,
}: {
  value: BreedAgeFilter;
  onChange: (next: BreedAgeFilter) => void;
}) {
  // 菜单开关只有这个组件自己关心，所以 state 放在这里而不是 DashboardPage
  const [open, setOpen] = useState(false);
  const activeCount = value.species.length + value.ageGroups.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={
          "inline-flex items-center gap-1.5 hover:text-slate-900 " +
          (activeCount > 0 ? "text-teal-700" : "")
        }
      >
        Breed &amp; Age
        <Funnel className="size-3.5" />
        {activeCount > 0 && (
          <span className="rounded-full bg-teal-600 px-1.5 text-xs text-white">{activeCount}</span>
        )}
      </button>

      {open && (
        <>
          {/* 透明遮罩：点菜单外面任意位置关闭菜单 */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 font-normal text-slate-700 shadow-lg">
            <FilterGroup title="Species">
              {SPECIES_OPTIONS.map((s) => (
                <Checkbox
                  key={s}
                  label={s}
                  checked={value.species.includes(s)}
                  onChange={() => onChange({ ...value, species: toggle(value.species, s) })}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Age">
              {AGE_OPTIONS.map((age) => (
                <Checkbox
                  key={age}
                  label={age}
                  checked={value.ageGroups.includes(age)}
                  onChange={() => onChange({ ...value, ageGroups: toggle(value.ageGroups, age) })}
                />
              ))}
            </FilterGroup>

            <button
              onClick={() => onChange({ species: [], ageGroups: [] })}
              disabled={activeCount === 0}
              className="mt-1 text-xs text-slate-500 underline underline-offset-2 hover:text-slate-800 disabled:opacity-40"
            >
              Clear filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-teal-600" />
      {label}
    </label>
  );
}

// ---------- 表格行 ----------

function AnimalRow({
  animal,
  selected,
  onClick,
}: {
  animal: Animal;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={
        "cursor-pointer border-t border-slate-100 transition-colors " +
        (selected ? "bg-teal-50" : "hover:bg-slate-50")
      }
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <AnimalPhoto src={animal.photoUrl} name={animal.name} className="size-11 shrink-0 rounded-lg" />
          <div>
            <div className="font-semibold text-slate-900">{animal.name}</div>
            <div className="text-xs text-slate-400">ID: #{animal.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600">{formatBreedAge(animal)}</td>
      <td className="px-6 py-4 text-slate-600">{animal.daysInShelter} days</td>
      <td className={"px-6 py-4 " + (selected ? "font-semibold text-teal-700" : "text-slate-600")}>
        ~{animal.estimatedRemainingDays} days
      </td>
      <td className="px-6 py-4">
        <TierBadge tier={animal.priorityTier} />
      </td>
    </tr>
  );
}

// ---------- 分页按钮 ----------

function PageButton({
  children,
  active = false,
  disabled = false,
  onClick,
  label,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={
        "flex size-9 items-center justify-center rounded-lg border text-sm transition disabled:cursor-not-allowed disabled:opacity-40 " +
        (active
          ? "border-teal-300 bg-teal-50 font-medium text-teal-700"
          : "border-slate-200 text-slate-600 hover:bg-slate-50")
      }
    >
      {children}
    </button>
  );
}
