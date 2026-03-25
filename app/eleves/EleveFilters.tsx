"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getStatutClasses, getStatutLabel, renderStars } from "@/lib/utils";
import type {
  CoursType,
  EleveWithCotisation,
  StatutCotisation,
} from "@/types";

type Props = { eleves: EleveWithCotisation[] };

export default function EleveFilters({ eleves }: Props) {
  const [search, setSearch] = useState("");
  const [filterCours, setFilterCours] = useState<"all" | CoursType>("all");
  const [filterStatut, setFilterStatut] = useState<
    "all" | StatutCotisation
  >("all");

  const filtered = useMemo(() => {
    return eleves.filter((e) => {
      const matchSearch =
        search === "" ||
        `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase());
      const matchCours =
        filterCours === "all" || e.cours.includes(filterCours);
      const matchStatut =
        filterStatut === "all" ||
        e.cotisation_mois?.statut === filterStatut;
      return matchSearch && matchCours && matchStatut;
    });
  }, [eleves, search, filterCours, filterStatut]);

  return (
    <>
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-gray-500 focus:outline-none"
        />
        <select
          value={filterCours}
          onChange={(e) =>
            setFilterCours(e.target.value as "all" | CoursType)
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-gray-500 focus:outline-none"
        >
          <option value="all">Tous les cours</option>
          <option value="arabe">Arabe</option>
          <option value="coran">Coran</option>
        </select>
        <select
          value={filterStatut}
          onChange={(e) =>
            setFilterStatut(e.target.value as "all" | StatutCotisation)
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-gray-500 focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="paye">Payé</option>
          <option value="retard">Retard</option>
          <option value="en_attente">En attente</option>
        </select>
      </div>

      {/* Empty states */}
      {eleves.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          Aucun élève.{" "}
          <Link
            href="/eleves/nouveau"
            className="underline hover:text-gray-600"
          >
            Ajoutez votre premier élève.
          </Link>
        </div>
      ) : null}

      {eleves.length > 0 && filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          Aucun élève trouvé.
        </div>
      ) : null}

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="w-full overflow-x-auto">
            <table className="min-w-[820px] w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {[
                  "Nom / Prénom",
                  "Cours",
                  "Niveau",
                  "Statut du mois",
                  "Téléphone",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((eleve) => (
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
                  <td className="px-4 py-3 text-base tracking-wider text-amber-500">
                    {renderStars(eleve.niveau)}
                  </td>
                  <td className="px-4 py-3">
                    {eleve.cotisation_mois ? (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatutClasses(eleve.cotisation_mois.statut)}`}
                      >
                        {getStatutLabel(eleve.cotisation_mois.statut)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {eleve.telephone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/eleves/${eleve.id}`}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}
