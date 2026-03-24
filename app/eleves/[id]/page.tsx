import EleveCotisationsCard from "@/components/eleves/EleveCotisationsCard";
import EleveDeleteButton from "@/components/eleves/EleveDeleteButton";
import EleveNiveauEditor from "@/components/eleves/EleveNiveauEditor";
import EleveNotesEditor from "@/components/eleves/EleveNotesEditor";
import EleveWhatsAppSender from "@/components/eleves/EleveWhatsAppSender";
import { createClient } from "@/lib/supabase/server";
import { buildWhatsAppUrl } from "@/lib/utils";
import type {
  Cotisation,
  CoursType,
  Eleve,
  MessageTemplate,
} from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EleveDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [eleveRes, cotisationsRes, templatesRes] = await Promise.all([
    supabase.from("eleves").select("*").eq("id", id).single(),
    supabase
      .from("cotisations")
      .select("*")
      .eq("eleve_id", id)
      .order("mois", { ascending: false }),
    supabase.from("message_templates").select("*").order("titre"),
  ]);

  if (eleveRes.error || !eleveRes.data) {
    notFound();
  }

  const eleve = eleveRes.data as Eleve;
  const cotisations = (cotisationsRes.data ?? []) as Cotisation[];
  const templates = (templatesRes.data ?? []) as MessageTemplate[];

  const waHref = eleve.telephone
    ? buildWhatsAppUrl(eleve.telephone, "")
    : null;

  return (
    <div>
      <section className="mb-4 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <h1 className="flex-1 text-xl font-semibold text-gray-900">
            {eleve.prenom} {eleve.nom}
          </h1>
          <Link
            href={`/eleves/${id}/modifier`}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Modifier
          </Link>
          <EleveDeleteButton eleveId={id} />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-1">
            {eleve.cours.map((c: CoursType) => (
              <span
                key={c}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-700"
              >
                {c}
              </span>
            ))}
          </div>
          <EleveNiveauEditor eleveId={id} initialNiveau={eleve.niveau} />
        </div>

        <div className="mb-4 text-sm text-gray-700">
          {eleve.telephone ? (
            <>
              <span>{eleve.telephone}</span>
              {waHref ? (
                <>
                  <span className="text-gray-400"> · </span>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-700 hover:underline"
                  >
                    WhatsApp ↗
                  </a>
                </>
              ) : null}
            </>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>

        <div>
          <EleveNotesEditor eleveId={id} initialNotes={eleve.notes} />
        </div>
      </section>

      <section className="mb-4 rounded-lg border border-gray-200 bg-white p-6">
        <EleveCotisationsCard eleveId={id} cotisations={cotisations} />
      </section>

      <section className="mb-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">
          Envoyer un message
        </h2>
        {!eleve.telephone ? (
          <p className="text-sm text-amber-600">
            ⚠ Aucun numéro de téléphone enregistré pour cet élève.
          </p>
        ) : (
          <EleveWhatsAppSender
            eleve={eleve}
            cotisations={cotisations}
            templates={templates}
          />
        )}
      </section>
    </div>
  );
}
