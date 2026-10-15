// src/components/dashboard/InfoBanner.tsx
import { Info } from "lucide-react";

interface InfoBannerProps {
  animalCount: number;
  suggestionCount: number;
}

export default function InfoBanner({ animalCount, suggestionCount }: InfoBannerProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-teal-200 bg-teal-50 px-5 py-4 text-sm text-teal-900">
      <Info className="mt-0.5 size-5 shrink-0 text-teal-600" />
      <p>
        These are suggestions to help prioritize promotion. Staff make all final decisions.
        Showing {animalCount} animals and {suggestionCount} suggestions across the current
        filter.{" "}
        <a href="#" className="font-semibold underline underline-offset-2 hover:text-teal-700">
          About these predictions.
        </a>
      </p>
    </div>
  );
}
