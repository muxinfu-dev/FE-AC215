// src/components/detail/AnimalDetailPanel.tsx
// 右侧详情面板：传入一只动物，显示它的全部信息
// 关闭、勾选、Dismiss 都通过回调通知 DashboardPage，面板自己不改数据

import type { ReactNode } from "react";
import { Camera, History, Info, X } from "lucide-react";
import type { ActionLog, Animal, Suggestion, SuggestionStatus } from "@/types/animal";
import { formatShortDate } from "@/lib/format";
import AnimalPhoto from "@/components/common/AnimalPhoto";

interface AnimalDetailPanelProps {
  animal: Animal;
  onClose: () => void;
  onSuggestionChange: (suggestionId: string, status: SuggestionStatus) => void;
}

export default function AnimalDetailPanel({
  animal,
  onClose,
  onSuggestionChange,
}: AnimalDetailPanelProps) {
  // Dismiss 掉的不显示；已完成的保留（打勾 + 划线），可以取消勾选
  const visibleSuggestions = animal.suggestions.filter((s) => s.status !== "dismissed");

  return (
    <aside className="w-[400px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white px-6 py-8">
      {/* ---------- 头部 ---------- */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{animal.name}</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            ID: #{animal.id} • {animal.daysInShelter} days in shelter
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* ---------- 照片 ---------- */}
      <div className="relative mt-6">
        <AnimalPhoto
          src={animal.photoUrl}
          name={animal.name}
          className="aspect-[4/3] w-full rounded-2xl text-5xl"
        />
        <button className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow hover:bg-slate-50">
          <Camera className="size-4" />
          Upload Photo
        </button>
      </div>

      {/* ---------- 照片评分 ---------- */}
      <div className="mt-6 rounded-xl bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <SectionTitle>Photo score</SectionTitle>
          <span className={"text-xl font-bold " + scoreColor(animal.photoScore)}>
            {animal.photoScore} / 100
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{animal.photoFeedback}</p>
      </div>

      {/* ---------- 预计停留 ---------- */}
      <div className="mt-8">
        <SectionTitle>Estimated stay</SectionTitle>
        <div className="mt-1 text-3xl font-bold text-teal-800">
          ~{animal.estimatedRemainingDays} more days
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Estimate is a projection of potential stay based on historical shelter data. Many
          individual factors aren't captured by the model.
        </p>
      </div>

      {/* ---------- 建议 ---------- */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          How we can help {animal.name}
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {visibleSuggestions.length > 0 ? (
            visibleSuggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onToggle={() => onSuggestionChange(s.id, s.status === "done" ? "open" : "done")}
                onDismiss={() => onSuggestionChange(s.id, "dismissed")}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500">No suggestions right now.</p>
          )}
        </div>
      </div>

      {/* ---------- 操作历史 ---------- */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Recent action history
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {animal.actionHistory.length > 0 ? (
            animal.actionHistory.map((log) => <ActionLogItem key={log.id} log={log} />)
          ) : (
            <p className="text-sm text-slate-500">No actions yet.</p>
          )}
        </div>
        <p className="mt-6 text-xs text-slate-400">
          Staff actions and dismissals are logged to help improve future model suggestions.
        </p>
      </div>
    </aside>
  );
}

// ---------- 小工具 ----------

// 分数越低颜色越“警示”
function scoreColor(score: number): string {
  if (score < 50) return "text-orange-600";
  if (score < 75) return "text-amber-600";
  return "text-teal-600";
}

// ---------- 子组件 ----------

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-700">
      {children}
      <Info className="size-3.5 text-slate-400" />
    </div>
  );
}

function SuggestionCard({
  suggestion,
  onToggle,
  onDismiss,
}: {
  suggestion: Suggestion;
  onToggle: () => void;
  onDismiss: () => void;
}) {
  const done = suggestion.status === "done";
  return (
    <div className={"rounded-xl border p-4 transition " + (done ? "border-teal-200 bg-teal-50/50" : "border-slate-200")}>
      <p className={"text-sm " + (done ? "text-slate-400 line-through" : "text-slate-900")}>
        {suggestion.message}
      </p>
      <div className="mt-3 flex items-center justify-between">
        {/* checked 来自数据，onChange 通知上层：受控 checkbox */}
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-teal-700">
          <input
            type="checkbox"
            checked={done}
            onChange={onToggle}
            className="size-4 accent-teal-600"
          />
          {suggestion.actionLabel}
        </label>
        {!done && (
          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

function ActionLogItem({ log }: { log: ActionLog }) {
  return (
    <div className="flex gap-2 text-sm">
      <History className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div>
        <div className="text-slate-700">
          {log.description} by <span className="font-semibold">{log.staff}</span>
        </div>
        <div className="text-xs text-slate-400">{formatShortDate(log.date)}</div>
      </div>
    </div>
  );
}
