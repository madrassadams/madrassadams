import { createClient } from "@/lib/supabase/server";
import EleveForm from "@/components/EleveForm";
import type { Eleve } from "@/types";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ModifierElevePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eleves")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const eleve = data as Eleve;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Modifier {eleve.prenom} {eleve.nom}
      </h1>
      <EleveForm action="edit" eleveId={id} defaultValues={eleve} />
    </div>
  );
}
