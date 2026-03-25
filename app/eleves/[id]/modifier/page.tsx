import { createClient } from "@/lib/supabase/server";
import { updateEleve } from "@/app/eleves/actions";
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
  const updateEleveWithId = updateEleve.bind(null, eleve.id);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Modifier {eleve.prenom} {eleve.nom}
      </h1>
      <EleveForm
        action={updateEleveWithId}
        defaultValues={eleve}
      />
    </div>
  );
}
