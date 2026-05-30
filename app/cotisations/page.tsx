import EleveCotisationStatutSelect from "@/components/eleves/EleveCotisationStatutSelect";
import { createClient } from "@/lib/supabase/server";
import {
  buildWhatsAppUrl,
  currentMoisISO,
  formatDate,
  formatMois,
  replaceTemplateVars,
} from "@/lib/utils";
import type {
  Cotisation,
  CoursType,
  Eleve,
  MessageTemplate,
  StatutCotisation,
} from "@/types";
import Link from "next/link";
import { updateCotisationStatut as updateStatutOnList } from "./actions";
import GenerateCotisations from "./GenerateCotisations";
import MonthNav from "./MonthNav";

type EleveRow = Pick<Eleve, "id" | "nom" | "prenom" | "cours" | "telephone">;

type Row = { eleve: EleveRow; cotisation: Cotisation | null };

function tier(statut: StatutCotisation | undefined): number {
  if (statut == null) return 3;
  if (statut === "retard") return 0;
  if (statut === "en_attente") return 1;
  if (statut === "paye") return 2;
  return 3;
}

function rowBgClass(c: Cotisation | null): string {
  if (!c) return "";
  if (c.statut === "paye") return "bg-green-50/40";
  if (c.statut === "retard") return "bg-red-50/40";
  return "";
}

type PageProps = {
  searchParams: Promise<{ mois?: string }>;
};

export default async function CotisationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const selectedMois =
    typeof sp.mois === "string" && /^\d{4}-\d{2}-01$/.test(sp.mois)
      ? sp.mois
      : currentMoisISO();

  const supabase = await createClient();

  const [elevesRes, cotisationsRes, templateRes] = await Promise.all([
    supabase
      .from("eleves")
      .select("id, nom, prenom, cours, telephone")
      .order("nom", { ascending: true }),
    supabase.from("cotisations").select("*").eq("mois", selectedMois),
    supabase.from("message_templates").select("*").limit(1).maybeSingle(),
  ]);

  const eleves = (elevesRes.data ?? []) as EleveRow[];
  const cotisations = (cotisationsRes.data ?? []) as Cotisation[];
  const template = templateRes.data as MessageTemplate | null;

  const byEleve = new Map<string, Cotisation>();
  for (const c of cotisations) {
    byEleve.set(c.eleve_id, c);
  }

  const rows: Row[] = eleves.map((eleve) => ({
    eleve,
    cotisation: byEleve.get(eleve.id) ?? null,
  }));

  rows.sort((a, b) => {
    const ta = tier(a.cotisation?.statut);
    const tb = tier(b.cotisation?.statut);
    if (ta !== tb) return ta - tb;
    return `${a.eleve.prenom} ${a.eleve.nom}`.localeCompare(
      `${b.eleve.prenom} ${b.eleve.nom}`,
      "fr",
    );
  });

  const countPaye = cotisations.filter((c) => c.statut === "paye").length;
  const countRetard = cotisations.filter((c) => c.statut === "retard").length;
  const countEnAttente = cotisations.filter(
    (c) => c.statut === "en_attente",
  ).length;

  const formatEuros = (n: number) =>
    n.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  const totalPaye = cotisations
    .filter((c) => c.statut === "paye")
    .reduce((s, c) => s + Number(c.montant), 0);
  const totalRetard = cotisations
    .filter((c) => c.statut === "retard")
    .reduce((s, c) => s + Number(c.montant), 0);
  const totalEnAttente = cotisations
    .filter((c) => c.statut === "en_attente")
    .reduce((s, c) => s + Number(c.montant), 0);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Cotisations</h1>
      <MonthNav currentMois={selectedMois} />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 md:p-5">
          <span className="block whitespace-nowrap text-2xl font-bold text-green-700 md:text-3xl">
            {formatEuros(totalPaye)}
          </span>
          <span className="mt-1 block text-sm font-medium text-green-600">
            ✓ Payé · {countPaye}
          </span>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 md:p-5">
          <span className="block whitespace-nowrap text-2xl font-bold text-red-700 md:text-3xl">
            {formatEuros(totalRetard)}
          </span>
          <span className="mt-1 block text-sm font-medium text-red-600">
            ✗ Retard · {countRetard}
          </span>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 md:p-5">
          <span className="block whitespace-nowrap text-2xl font-bold text-yellow-700 md:text-3xl">
            {formatEuros(totalEnAttente)}
          </span>
          <span className="mt-1 block text-sm font-medium text-yellow-600">
            ⏳ En attente · {countEnAttente}
          </span>
        </div>
      </div>

      <GenerateCotisations mois={selectedMois} />

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Élève</th>
              <th className="px-4 py-3">Cours</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Payé le</th>
              <th className="px-4 py-3">WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(({ eleve, cotisation }) => {
              const waText =
                template && cotisation && cotisation.statut !== "paye"
                  ? replaceTemplateVars(template.contenu, {
                      prenom: eleve.prenom,
                      nom: eleve.nom,
                      montant: cotisation.montant.toString(),
                      mois: formatMois(cotisation.mois),
                      cours: eleve.cours.join(", "),
                    })
                  : "";
              const showWa =
                Boolean(eleve.telephone) &&
                cotisation != null &&
                cotisation.statut !== "paye";

              return (
                <tr
                  key={eleve.id}
                  className={`hover:bg-gray-50 ${rowBgClass(cotisation)}`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/eleves/${eleve.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {eleve.prenom} {eleve.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {cotisation ? `${cotisation.montant} €` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {cotisation ? (
                      <EleveCotisationStatutSelect
                        cotisation={cotisation}
                        listUpdateStatut={updateStatutOnList}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cotisation?.paid_at
                      ? formatDate(cotisation.paid_at)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {showWa && eleve.telephone ? (
                      <a
                        href={buildWhatsAppUrl(eleve.telephone, waText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-700 hover:underline"
                      >
                        WA ↗
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
