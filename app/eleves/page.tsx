import { createClient } from "@/lib/supabase/server";
import { currentMoisISO } from "@/lib/utils";
import type { EleveWithCotisation } from "@/types";
import Link from "next/link";
import EleveFilters from "./EleveFilters";

export default async function ElevesPage() {
  const supabase = await createClient();
  const mois = currentMoisISO();

  const [{ data: eleves }, { data: cotisations }] = await Promise.all([
    supabase.from("eleves").select("*").order("nom", { ascending: true }),
    supabase.from("cotisations").select("*").eq("mois", mois),
  ]);

  const elevesWithCotisation: EleveWithCotisation[] = (eleves ?? []).map(
    (e) => ({
      ...e,
      cotisation_mois:
        cotisations?.find((c) => c.eleve_id === e.id) ?? null,
    }),
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Élèves</h1>
        <Link
          href="/eleves/nouveau"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-gray-900 px-4 text-base text-white transition-colors hover:bg-gray-700"
        >
          Ajouter un élève
        </Link>
      </div>
      <EleveFilters eleves={elevesWithCotisation} />
    </div>
  );
}
