"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { inputValueToMois } from "@/lib/utils";
import type { CoursType, StatutCotisation } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const eleveSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  cours: z
    .array(z.enum(["arabe", "coran"]))
    .min(1, "Sélectionnez au moins un cours"),
  niveau: z.number().int().min(1).max(5),
  telephone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

function parseEleveForm(formData: FormData) {
  const coursAll = formData.getAll("cours").filter((v): v is string => typeof v === "string");
  const cours = coursAll.filter((c): c is CoursType => c === "arabe" || c === "coran");

  const tel = formData.get("telephone");
  const telephone =
    tel == null || String(tel).trim() === "" ? null : String(tel).trim();

  const n = formData.get("notes");
  const notes = n == null || String(n).trim() === "" ? null : String(n);

  return {
    prenom: String(formData.get("prenom") ?? "").trim(),
    nom: String(formData.get("nom") ?? "").trim(),
    cours,
    niveau: Number(formData.get("niveau")),
    telephone,
    notes,
  };
}

function validateEleveForm(formData: FormData) {
  const raw = parseEleveForm(formData);
  const result = eleveSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? "Données invalides";
    throw new Error(msg);
  }
  return result.data;
}

export async function createEleve(
  prevState: unknown,
  formData: FormData,
): Promise<unknown> {
  void prevState;
  const data = validateEleveForm(formData);
  const supabase = await createServerClient();

  // Guard against double-submit inserting duplicate rows.
  // If an identical (prenom, nom) record exists within the last 5 seconds,
  // consider it the same submit and redirect to the existing id.
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
  const { data: existing, error: existingError } = await supabase
    .from("eleves")
    .select("id")
    .eq("prenom", data.prenom)
    .eq("nom", data.nom)
    .gte("created_at", fiveSecondsAgo)
    .limit(1)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing?.id) {
    redirect("/eleves/" + existing.id);
  }

  const { data: row, error } = await supabase
    .from("eleves")
    .insert({
      prenom: data.prenom,
      nom: data.nom,
      cours: data.cours,
      niveau: data.niveau,
      telephone: data.telephone,
      notes: data.notes,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  if (!row?.id) throw new Error("Création impossible");

  redirect("/eleves/" + row.id);
}

export async function updateEleve(
  id: string,
  prevState: unknown,
  formData: FormData,
): Promise<unknown> {
  void prevState;
  const data = validateEleveForm(formData);
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("eleves")
    .update({
      prenom: data.prenom,
      nom: data.nom,
      cours: data.cours,
      niveau: data.niveau,
      telephone: data.telephone,
      notes: data.notes,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/eleves/" + id);
  redirect("/eleves/" + id);
}

export async function deleteEleve(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.from("eleves").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/eleves");
  redirect("/eleves");
}

export async function updateNotes(id: string, notes: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("eleves")
    .update({ notes: notes.trim() === "" ? null : notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/eleves/" + id);
}

export async function updateNiveau(id: string, niveau: number): Promise<void> {
  const parsed = z.number().int().min(1).max(5).safeParse(niveau);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Niveau invalide");
  }
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("eleves")
    .update({ niveau: parsed.data })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/eleves/" + id);
}

export async function createCotisation(
  eleveId: string,
  formData: FormData,
): Promise<void> {
  const moisRaw = formData.get("mois");
  if (typeof moisRaw !== "string" || !moisRaw) {
    throw new Error("Mois requis");
  }
  const mois = inputValueToMois(moisRaw);
  const montant = Number(formData.get("montant"));
  if (!Number.isFinite(montant) || montant <= 0) {
    throw new Error("Montant invalide");
  }
  const statutRaw = formData.get("statut");
  if (typeof statutRaw !== "string") throw new Error("Statut requis");
  const statutParsed = z
    .enum(["paye", "retard", "en_attente"])
    .safeParse(statutRaw);
  if (!statutParsed.success) throw new Error("Statut invalide");
  const statut = statutParsed.data;

  const paid_at = statut === "paye" ? new Date().toISOString() : null;

  const supabase = await createServerClient();
  const { error } = await supabase.from("cotisations").insert({
    eleve_id: eleveId,
    mois,
    montant,
    statut,
    paid_at,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/eleves/" + eleveId);
}

export async function updateCotisationStatut(
  id: string,
  statut: StatutCotisation,
  eleveId: string,
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
  revalidatePath("/eleves/" + eleveId);
}

export async function deleteCotisation(
  id: string,
  eleveId: string,
): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.from("cotisations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/eleves/" + eleveId);
}
