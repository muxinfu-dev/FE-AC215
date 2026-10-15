// src/lib/format.ts
// 日期和文字格式化的小工具

import type { Animal } from "@/types/animal";

// "2026-09-26" → Date
function parseDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// "2026-09-26" → "Saturday, Sep 26 2026"
export function formatLongDate(iso: string): string {
  const date = parseDate(iso);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${weekday}, ${monthDay} ${date.getFullYear()}`;
}

// "2026-09-22" → "Sep 22, 2026"
export function formatShortDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// → "Dog • Mixed / Adult"
export function formatBreedAge(animal: Animal): string {
  return `${animal.species} • ${animal.breed} / ${animal.ageGroup}`;
}
