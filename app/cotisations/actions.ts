"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import type { StatutCotisation } from "@/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function generateCotisations(
  mois: string,
  montant: number,
): Promise<{ created: number }> {
  if (!Number.isFinite(montant) || montant <= 0) {
    throw new Error("Montant invalide");
  }

  const supabase = await createServerClient();

  const { data: eleves, error: e1 } = await supabase.from("eleves").select("id");
  if (e1) throw new Error(e1.message);
  const allIds = (eleves ?? []).map((e) => e.id as string);

  const { data: existing, error: e2 } = await supabase
    .from("cotisations")
    .select("eleve_id")
    .eq("mois", mois);
  if (e2) throw new Error(e2.message);
  const existingSet = new Set(
    (existing ?? []).map((c) => c.eleve_id as string),
  );

  const missing = allIds.filter((id) => !existingSet.has(id));

  if (missing.length === 0) {
    revalidatePath("/cotisations");
    return { created: 0 };
  }

  const rows = missing.map((eleve_id) => ({
    eleve_id,
    mois,
    montant,
    statut: "en_attente" as const,
    paid_at: null as string | null,
  }));

  const { error: e3 } = await supabase.from("cotisations").insert(rows);
  if (e3) throw new Error(e3.message);

  revalidatePath("/cotisations");
  return { created: missing.length };
}

export async function updateCotisationStatut(
  id: string,
  statut: StatutCotisation,
): Promise<void> {
  const statutParsed = z
    .enum(["paye", "retard", "en_attente"])
    .safeParse(statut);
  if (!statutParsed.success) throw new Error("Statut invalide");

  const paid_at = statutParsed.data === "paye" ? new Date().toISOString() : null;

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("cotisations")
    .update({ statut: statutParsed.data, paid_at })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/cotisations");
}
