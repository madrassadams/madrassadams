import EleveAddCotisationForm from "@/components/eleves/EleveAddCotisationForm";
import EleveCotisationStatutSelect from "@/components/eleves/EleveCotisationStatutSelect";
import EleveDeleteCotisationButton from "@/components/eleves/EleveDeleteCotisationButton";
import EleveDeleteButton from "@/components/eleves/EleveDeleteButton";
import EleveNiveauEditor from "@/components/eleves/EleveNiveauEditor";
import EleveNotesEditor from "@/components/eleves/EleveNotesEditor";
import EleveWhatsAppSender from "@/components/eleves/EleveWhatsAppSender";
import { createClient } from "@/lib/supabase/server";
import {
  buildWhatsAppUrl,
  currentMoisISO,
  formatDate,
  formatMois,
  moisToInputValue,
} from "@/lib/utils";
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

  const totalCumule = (cotisations ?? [])
    .filter((c) => c.statut === "paye")
    .reduce((sum, c) => sum + Number(c.montant), 0);

  const totalCumuleFormatted = totalCumule.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  });

  const defaultMonth = moisToInputValue(currentMoisISO());

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Cotisations
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Total encaissé :
              <span className="font-semibold text-gray-900 ml-1">
                {totalCumuleFormatted}
              </span>
            </p>
          </div>
          <details>
            <summary className="cursor-pointer list-none text-sm text-gray-600 hover:text-gray-900 [&::-webkit-details-marker]:hidden">
              Ajouter
            </summary>
            <EleveAddCotisationForm
              eleveId={id}
              defaultMonth={defaultMonth}
            />
          </details>
        </div>

        {cotisations.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune cotisation</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-2 py-2">Mois</th>
                  <th className="px-2 py-2">Montant</th>
                  <th className="px-2 py-2">Statut</th>
                  <th className="px-2 py-2">Payé le</th>
                  <th className="px-2 py-2 text-right">Supprimer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cotisations.map((c) => {
                  const rowTint =
                    c.statut === "paye"
                      ? "bg-green-50/40"
                      : c.statut === "retard"
                        ? "bg-red-50/40"
                        : "";
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-gray-50 ${rowTint}`}
                    >
                      <td className="px-2 py-2">{formatMois(c.mois)}</td>
                      <td className="px-2 py-2 text-gray-700">
                        {c.montant} €
                      </td>
                      <td className="px-2 py-2">
                        <EleveCotisationStatutSelect
                          cotisation={c}
                          eleveId={id}
                        />
                      </td>
                      <td className="px-2 py-2 text-gray-600">
                        {c.paid_at ? formatDate(c.paid_at) : "—"}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <EleveDeleteCotisationButton
                          cotisationId={c.id}
                          eleveId={id}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
