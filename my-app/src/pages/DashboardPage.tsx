// src/pages/DashboardPage.tsx
// Dashboard 页面：把中间区域和右侧面板组装起来
// 现在全部是静态的；第 6、7 步会把下面写死的常量换成 useState

import { CircleCheck, CircleDot, Lightbulb, PawPrint } from "lucide-react";
import { mockAnimals, mockSummary } from "@/data/mockAnimals";
import PageHeader from "@/components/dashboard/PageHeader";
import InfoBanner from "@/components/dashboard/InfoBanner";
import StatCard from "@/components/dashboard/StatCard";
import TierFilter from "@/components/dashboard/TierFilter";
import AnimalTable from "@/components/dashboard/AnimalTable";
import AnimalDetailPanel from "@/components/detail/AnimalDetailPanel";

const PAGE_SIZE = 6;
const CURRENT_PAGE = 1; // 第 7 步改成 state
const SELECTED_ID = "4810"; // 第 6 步改成 state：点哪行就显示哪只

export default function DashboardPage() {
  // ---- 从数据算出要显示的东西（类似 pandas 的处理流程）----
  const selectedAnimal = mockAnimals.find((a) => a.id === SELECTED_ID);

  const pageRows = mockAnimals.slice(
    (CURRENT_PAGE - 1) * PAGE_SIZE,
    CURRENT_PAGE * PAGE_SIZE
  );

  // 所有动物里还没处理的建议总数，相当于 df.suggestions.explode().query("status == 'open'").count()
  const openSuggestionCount = mockAnimals
    .flatMap((a) => a.suggestions)
    .filter((s) => s.status === "open").length;

  return (
    // <> </> 是 Fragment：把两个元素一起返回，又不多套一层 div
    // 这样 main 和 aside 直接成为 AppLayout flex 容器的子元素
    <>
      <main className="flex-1 overflow-y-auto px-10 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <PageHeader title="Today's Priorities" date={mockSummary.date} />

          <InfoBanner
            animalCount={mockAnimals.length}
            suggestionCount={openSuggestionCount}
          />

          {/* 同一个 StatCard 组件，传不同参数复用 4 次 */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              icon={PawPrint}
              label="Animals available for adoption"
              value={mockSummary.availableForAdoption}
            />
            <StatCard
              icon={CircleDot}
              label="Attention Needed"
              value={mockSummary.attentionNeeded}
            />
            <StatCard
              icon={Lightbulb}
              label="Priorities today"
              value={mockSummary.prioritiesToday}
            />
            <StatCard
              icon={CircleCheck}
              label="Suggestions acted on this week"
              value={mockSummary.suggestionsActedThisWeek}
            />
          </div>

          <TierFilter />

          <AnimalTable
            animals={pageRows}
            totalCount={mockAnimals.length}
            page={CURRENT_PAGE}
            pageSize={PAGE_SIZE}
            selectedId={SELECTED_ID}
          />

          <p className="text-sm text-slate-400">
            Suggestions updated daily at {mockSummary.suggestionsUpdatedAt}. Model version{" "}
            {mockSummary.modelVersion}.
          </p>
        </div>
      </main>

      {/* selectedAnimal 存在才显示右侧面板 */}
      {selectedAnimal && <AnimalDetailPanel animal={selectedAnimal} />}
    </>
  );
}
