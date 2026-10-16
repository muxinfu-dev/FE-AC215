// src/lib/animalQuery.ts
// 表格的数据流水线：原始数据 → 分级筛选 → 品种/年龄筛选 → 搜索 → 排序 → 分页
// 纯函数：输入数据和查询条件，输出要显示的行。不碰任何 React state。
// 以后接后端时，这些查询条件会原样变成 GET /api/animals 的参数，由后端来算。

import type { AgeGroup, Animal, PriorityTier, Species } from "@/types/animal";

export type SortKey = "name" | "daysInShelter" | "estimatedRemainingDays" | "priorityTier";
export type SortDir = "asc" | "desc";

export interface SortState {
  key: SortKey;
  dir: SortDir;
}

// 品种 & 年龄筛选：空数组 = 不筛选（全部）
export interface BreedAgeFilter {
  species: Species[];
  ageGroups: AgeGroup[];
}

export interface AnimalQuery {
  tier: PriorityTier | null;
  breedAge: BreedAgeFilter;
  search: string;
  sort: SortState | null;
  page: number;
  pageSize: number;
}

export interface QueryResult {
  rows: Animal[]; // 当前页的行
  filtered: Animal[]; // 筛选后的全部行（用于计数）
  total: number;
  pageCount: number;
  page: number; // 修正后的页码（防止筛选后页数变少，停在不存在的页）
}

// 分级排序时的先后：attention 最紧急
const TIER_RANK: Record<PriorityTier, number> = {
  attention: 0,
  moderate: 1,
  likely_soon: 2,
};

export function queryAnimals(animals: Animal[], q: AnimalQuery): QueryResult {
  let result = animals;

  // 1. 分级筛选    ≈ df[df.tier == tier]
  if (q.tier) {
    result = result.filter((a) => a.priorityTier === q.tier);
  }

  // 2. 品种 & 年龄筛选    ≈ df[df.species.isin(species)]
  if (q.breedAge.species.length > 0) {
    result = result.filter((a) => q.breedAge.species.includes(a.species));
  }
  if (q.breedAge.ageGroups.length > 0) {
    result = result.filter((a) => q.breedAge.ageGroups.includes(a.ageGroup));
  }

  // 3. 搜索：名字、ID、品种都能搜，不区分大小写
  const term = q.search.trim().toLowerCase();
  if (term) {
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.id.includes(term) ||
        a.breed.toLowerCase().includes(term)
    );
  }

  // 4. 排序    ≈ df.sort_values(key, ascending=...)
  //    注意 [...result]：先复制再排，sort 会原地修改数组
  if (q.sort) {
    const { key, dir } = q.sort;
    const sign = dir === "asc" ? 1 : -1;
    result = [...result].sort((a, b) => {
      let diff: number;
      if (key === "name") diff = a.name.localeCompare(b.name);
      else if (key === "priorityTier") diff = TIER_RANK[a.priorityTier] - TIER_RANK[b.priorityTier];
      else diff = a[key] - b[key];
      return diff * sign;
    });
  }

  // 5. 分页    ≈ df.iloc[start:end]
  const total = result.length;
  const pageCount = Math.max(1, Math.ceil(total / q.pageSize));
  const page = Math.min(Math.max(1, q.page), pageCount);
  const start = (page - 1) * q.pageSize;

  return {
    rows: result.slice(start, start + q.pageSize),
    filtered: result,
    total,
    pageCount,
    page,
  };
}
