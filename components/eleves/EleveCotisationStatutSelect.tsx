"use client";

import { updateCotisationStatut } from "@/app/eleves/actions";
import { getStatutClasses, getStatutLabel } from "@/lib/utils";
import type { Cotisation, StatutCotisation } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  cotisation: Cotisation;
  /** Used with élève detail action when `listUpdateStatut` is not set */
  eleveId?: string;
  /** Cotisations list page: update without élève-scoped revalidation */
  listUpdateStatut?: (
    id: string,
    statut: StatutCotisation,
  ) => Promise<void>;
};

const STATUTS: StatutCotisation[] = ["en_attente", "paye", "retard"];

export default function EleveCotisationStatutSelect({
  cotisation,
  eleveId,
  listUpdateStatut,
}: Props) {
  const router = useRouter();
  const [statut, setStatut] = useState<StatutCotisation>(cotisation.statut);

  useEffect(() => {
    setStatut(cotisation.statut);
  }, [cotisation.id, cotisation.statut]);

  async function onChange(next: StatutCotisation) {
    const prev = statut;
    setStatut(next);
    try {
      if (listUpdateStatut) {
        await listUpdateStatut(cotisation.id, next);
      } else {
        if (!eleveId) {
          throw new Error("eleveId requis");
        }
        await updateCotisationStatut(cotisation.id, next, eleveId);
      }
      router.refresh();
    } catch {
      setStatut(prev);
    }
  }

  return (
    <select
      value={statut}
      onChange={(e) => onChange(e.target.value as StatutCotisation)}
      className={`rounded-full border-0 px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-gray-400 ${getStatutClasses(statut)}`}
    >
      {STATUTS.map((s) => (
        <option key={s} value={s}>
          {getStatutLabel(s)}
        </option>
      ))}
    </select>
  );
}
