"use client";

import { formatMois } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Props = { currentMois: string };

function addMonths(iso: string, delta: number): string {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export default function MonthNav({ currentMois }: Props) {
  const router = useRouter();
  const prev = addMonths(currentMois, -1);
  const next = addMonths(currentMois, 1);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm">
      <button
        type="button"
        onClick={() => router.push(`/cotisations?mois=${encodeURIComponent(prev)}`)}
        className="text-gray-600 hover:text-gray-900"
      >
        ← Précédent
      </button>
      <span className="min-w-[10rem] text-center font-medium text-gray-900">
        {formatMois(currentMois).replace(/^\w/, (c) => c.toUpperCase())}
      </span>
      <button
        type="button"
        onClick={() => router.push(`/cotisations?mois=${encodeURIComponent(next)}`)}
        className="text-gray-600 hover:text-gray-900"
      >
        Suivant →
      </button>
    </div>
  );
}
