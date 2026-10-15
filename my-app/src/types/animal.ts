// src/types/animal.ts
// FurCast 数据结构定义

export type Species = "Dog" | "Cat";

export type AgeGroup = "Puppy" | "Kitten" | "Young" | "Adult" | "Senior";

// 分级规则
//   attention   → 预计剩余 20 天以上
//   moderate    → 预计剩余 10–20 天
//   likely_soon → 预计剩余 10 天以内
export type PriorityTier = "attention" | "moderate" | "likely_soon";

export type SuggestionStatus = "open" | "done" | "dismissed";

// 右侧面板 "How we can help" 里的一条建议
export interface Suggestion {
  id: string;
  message: string; // "Her cover photo could be brighter."
  actionLabel: string; // "Retake photo"
  status: SuggestionStatus;
}

// 右侧面板 "Recent action history" 里的一条记录
export interface ActionLog {
  id: string;
  description: string; // "Bio refreshed"
  staff: string; // "Staff A"
  date: string; // ISO 日期 "2026-09-22"
}

export interface Animal {
  id: string; // "4810"，显示时加 #
  name: string;
  species: Species;
  breed: string; // "Mixed" / "Terrier" / "Shorthair"
  ageGroup: AgeGroup;
  daysInShelter: number;

  // 模型输出
  estimatedRemainingDays: number;
  priorityTier: PriorityTier;
  photoScore: number; // 0–100
  photoFeedback: string;

  photoUrl: string;
  isFeaturedOnHomepage: boolean;
  suggestions: Suggestion[];
  actionHistory: ActionLog[];
}

// 顶部 4 张数字卡片 + 底部说明
export interface DashboardSummary {
  date: string;
  availableForAdoption: number;
  attentionNeeded: number;
  prioritiesToday: number;
  suggestionsActedThisWeek: number;
  modelVersion: string;
  suggestionsUpdatedAt: string; // "6:00 AM"
}
