// src/pages/DashboardPage.tsx
// Dashboard 页面：所有“会变的东西”都存在这里，子组件只负责显示 + 通知这里

import { useState } from "react";
import { CircleCheck, CircleDot, Lightbulb, PawPrint } from "lucide-react";
import type { Animal, PriorityTier, SuggestionStatus } from "@/types/animal";
import { mockAnimals, mockSummary } from "@/data/mockAnimals";
import {
  queryAnimals,
  type BreedAgeFilter,
  type SortKey,
  type SortState,
} from "@/lib/animalQuery";
import PageHeader from "@/components/dashboard/PageHeader";
import InfoBanner from "@/components/dashboard/InfoBanner";
import StatCard from "@/components/dashboard/StatCard";
import TierFilter from "@/components/dashboard/TierFilter";
import AnimalTable from "@/components/dashboard/AnimalTable";
import AnimalDetailPanel from "@/components/detail/AnimalDetailPanel";

const PAGE_SIZE = 6;
const CURRENT_STAFF = "Jessica Martinez"; // 以后从登录信息拿
const TODAY = mockSummary.date;

export default function DashboardPage() {
  // ================= State =================
  // 动物数据本身也是 state：勾选 / Dismiss 建议会修改它
  // （接后端后，这里改成从 API 加载）
  const [animals, setAnimals] = useState<Animal[]>(mockAnimals);

  // 第 6 步：当前选中的动物（null = 面板关闭）
  const [selectedId, setSelectedId] = useState<string | null>("4810");

  // 第 7 步：查询条件
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<PriorityTier | null>(null);
  const [breedAge, setBreedAge] = useState<BreedAgeFilter>({ species: [], ageGroups: [] });
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);

  // ================= 派生数据 =================
  // 每次渲染时从 state 现算，不另存一份“过滤后的数据”
  const result = queryAnimals(animals, {
    tier,
    breedAge,
    search,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  const selectedAnimal = animals.find((a) => a.id === selectedId) ?? null;

  const openSuggestionCount = result.filtered
    .flatMap((a) => a.suggestions)
    .filter((s) => s.status === "open").length;

  // ================= 事件处理 =================
  // 改变筛选 / 搜索 / 排序时回到第 1 页，否则可能停在一个空页

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleTier(next: PriorityTier) {
    // 再点一次同一个按钮 = 取消筛选
    setTier((current) => (current === next ? null : next));
    setPage(1);
  }

  function handleBreedAge(next: BreedAgeFilter) {
    setBreedAge(next);
    setPage(1);
  }

  // 点同一列循环：升序 → 降序 → 取消排序
  function handleSort(key: SortKey) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null;
    });
    setPage(1);
  }

  // 第 8 步：勾选 / 取消勾选 / Dismiss 一条建议
  function handleSuggestionChange(
    animalId: string,
    suggestionId: string,
    status: SuggestionStatus
  ) {
    // 不可变更新：不改原数组，而是生成一个新数组（类似 df.copy() 后再改）
    // React 靠“是不是新对象”来判断要不要重新渲染
    setAnimals((prev) =>
      prev.map((animal) => {
        if (animal.id !== animalId) return animal;

        const suggestion = animal.suggestions.find((s) => s.id === suggestionId);
        if (!suggestion) return animal;

        // 完成或 Dismiss 时记一条操作历史；取消勾选不记
        const newLogs =
          status === "open"
            ? []
            : [
                {
                  id: `log-${Date.now()}`,
                  description:
                    status === "done"
                      ? `Completed: ${suggestion.actionLabel}`
                      : `Suggestion dismissed: "${suggestion.actionLabel}"`,
                  staff: CURRENT_STAFF,
                  date: TODAY,
                },
              ];

        return {
          ...animal,
          suggestions: animal.suggestions.map((s) =>
            s.id === suggestionId ? { ...s, status } : s
          ),
          actionHistory: [...animal.actionHistory, ...newLogs],
        };
      })
    );
  }

  // ================= 渲染 =================
  return (
    <>
      <main className="flex-1 overflow-y-auto px-10 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <PageHeader
            title="Today's Priorities"
            date={mockSummary.date}
            search={search}
            onSearchChange={handleSearch}
          />

          <InfoBanner animalCount={result.total} suggestionCount={openSuggestionCount} />

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              icon={PawPrint}
              label="Animals available for adoption"
              value={mockSummary.availableForAdoption}
            />
            <StatCard icon={CircleDot} label="Attention Needed" value={mockSummary.attentionNeeded} />
            <StatCard icon={Lightbulb} label="Priorities today" value={mockSummary.prioritiesToday} />
            <StatCard
              icon={CircleCheck}
              label="Suggestions acted on this week"
              value={mockSummary.suggestionsActedThisWeek}
            />
          </div>

          <TierFilter active={tier} onSelect={handleTier} />

          <AnimalTable
            animals={result.rows}
            totalCount={result.total}
            page={result.page}
            pageCount={result.pageCount}
            pageSize={PAGE_SIZE}
            selectedId={selectedId}
            sort={sort}
            breedAge={breedAge}
            onRowClick={setSelectedId}
            onSort={handleSort}
            onBreedAgeChange={handleBreedAge}
            onPageChange={setPage}
          />

          <p className="text-sm text-slate-400">
            Suggestions updated daily at {mockSummary.suggestionsUpdatedAt}. Model version{" "}
            {mockSummary.modelVersion}.
          </p>
        </div>
      </main>

      {selectedAnimal && (
        <AnimalDetailPanel
          // key 换了 = 换一只动物时组件重置（比如照片加载失败的状态不会带到下一只）
          key={selectedAnimal.id}
          animal={selectedAnimal}
          onClose={() => setSelectedId(null)}
          onSuggestionChange={(suggestionId, status) =>
            handleSuggestionChange(selectedAnimal.id, suggestionId, status)
          }
        />
      )}
    </>
  );
}
