import MessagesClient from "@/components/MessagesClient";
import { createClient } from "@/lib/supabase/server";
import { currentMoisISO } from "@/lib/utils";
import type {
  Cotisation,
  Eleve,
  EleveWithCotisation,
  MessageTemplate,
} from "@/types";

export default async function MessagesPage() {
  const supabase = await createClient();
  const mois = currentMoisISO();

  const [templatesRes, elevesRes, cotisationsRes] = await Promise.all([
    supabase
      .from("message_templates")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase.from("eleves").select("*").order("nom", { ascending: true }),
    supabase.from("cotisations").select("*").eq("mois", mois),
  ]);

  const templates = (templatesRes.data ?? []) as MessageTemplate[];
  const eleves = (elevesRes.data ?? []) as Eleve[];
  const cotisations = (cotisationsRes.data ?? []) as Cotisation[];

  const elevesWithCotisation: EleveWithCotisation[] = eleves.map((e) => ({
    ...e,
    cotisation_mois: cotisations.find((c) => c.eleve_id === e.id) ?? null,
  }));

  return (
    <MessagesClient
      templates={templates}
      eleves={elevesWithCotisation}
    />
  );
}
