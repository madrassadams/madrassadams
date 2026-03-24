import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  buildWhatsAppUrl,
  currentMoisISO,
  formatDate,
  formatMois,
  getStatutClasses,
  getStatutLabel,
  replaceTemplateVars,
  renderStars,
} from "@/lib/utils";
import type {
  CoursType,
  EleveWithCotisation,
  MessageTemplate,
} from "@/types";
import Link from "next/link";

export default async function Home() {
  const supabase = await createServerClient();
  const mois = currentMoisISO();

  const [
    { data: eleves },
    { data: cotisationsMois },
    { data: elevesRecents },
    { data: templates },
  ] = await Promise.all([
    supabase.from("eleves").select("*").order("created_at", { ascending: false }),
    supabase.from("cotisations").select("*").eq("mois", mois),
    supabase
      .from("eleves")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("message_templates")
      .select("*")
      .eq("titre", "Rappel cotisation")
      .limit(1),
  ]);

  const totalEleves = eleves?.length ?? 0;
  const countPaye =
    cotisationsMois?.filter((c) => c.statut === "paye").length ?? 0;
  const countRetard =
    cotisationsMois?.filter((c) => c.statut === "retard").length ?? 0;
  const countEnAttente =
    cotisationsMois?.filter((c) => c.statut === "en_attente").length ?? 0;

  const elevesAlerte: EleveWithCotisation[] = (cotisationsMois ?? [])
    .filter(
      (c) => c.statut === "retard" || c.statut === "en_attente",
    )
    .map((c) => ({
      ...eleves!.find((e) => e.id === c.eleve_id)!,
      cotisation_mois: c,
    }));

  const rappelTemplate: MessageTemplate | null = templates?.[0] ?? null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-gray-500">{formatMois(mois)}</p>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <span className="block text-3xl font-bold text-gray-900">
            {totalEleves}
          </span>
          <span className="mt-1 block text-sm text-gray-500">
            Élèves inscrits
          </span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <span className="block text-3xl font-bold text-green-600">
            {countPaye}
          </span>
          <span className="mt-1 block text-sm text-gray-500">
            Payé ce mois
          </span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <span className="block text-3xl font-bold text-red-600">
            {countRetard}
          </span>
          <span className="mt-1 block text-sm text-gray-500">En retard</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <span className="block text-3xl font-bold text-yellow-600">
            {countEnAttente}
          </span>
          <span className="mt-1 block text-sm text-gray-500">En attente</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Alertes</h2>

        {elevesAlerte.length === 0 ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            ✓ Aucun retard ce mois
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Élève
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    WhatsApp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {elevesAlerte.map((eleve) => {
                  const c = eleve.cotisation_mois!;
                  const waMessage = rappelTemplate
                    ? replaceTemplateVars(rappelTemplate.contenu, {
                        prenom: eleve.prenom,
                        nom: eleve.nom,
                        montant: c.montant.toString(),
                        mois: formatMois(c.mois),
                        cours: eleve.cours.join(", "),
                      })
                    : "";
                  return (
                    <tr key={eleve.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/eleves/${eleve.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {eleve.prenom} {eleve.nom}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {eleve.cours.map((co: CoursType) => (
                            <span
                              key={co}
                              className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-700"
                            >
                              {co}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatutClasses(c.statut)}`}
                        >
                          {getStatutLabel(c.statut)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.montant} €
                      </td>
                      <td className="px-4 py-3">
                        {eleve.telephone ? (
                          <a
                            href={buildWhatsAppUrl(eleve.telephone, waMessage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-700 hover:underline"
                          >
                            WA ↗
                          </a>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Ajouts récents
          </h2>
          <Link
            href="/eleves"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Voir tous →
          </Link>
        </div>

        {!elevesRecents?.length ? (
          <p className="text-sm text-gray-400">Aucun élève pour le moment.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Élève
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Niveau
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Inscrit le
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {elevesRecents.map((eleve) => (
                  <tr key={eleve.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/eleves/${eleve.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {eleve.prenom} {eleve.nom}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {eleve.cours.map((co: CoursType) => (
                          <span
                            key={co}
                            className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-700"
                          >
                            {co}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="tracking-wider text-amber-500">
                        {renderStars(eleve.niveau)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(eleve.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
