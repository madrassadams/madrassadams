"use client";

import type { Cotisation } from "@/types";
import {
  currentMoisISO,
  formatDate,
  formatMois,
  moisToInputValue,
} from "@/lib/utils";
import { useState } from "react";
import EleveAddCotisationForm from "./EleveAddCotisationForm";
import EleveCotisationStatutSelect from "./EleveCotisationStatutSelect";
import EleveDeleteCotisationButton from "./EleveDeleteCotisationButton";

type Props = {
  eleveId: string;
  cotisations: Cotisation[];
};

export default function EleveCotisationsCard({
  eleveId,
  cotisations,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const defaultMonth = moisToInputValue(currentMoisISO());

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Cotisations</h2>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {showAdd ? "Fermer" : "Ajouter"}
        </button>
      </div>

      {showAdd ? (
        <EleveAddCotisationForm
          eleveId={eleveId}
          defaultMonth={defaultMonth}
        />
      ) : null}

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
              {cotisations.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2">{formatMois(c.mois)}</td>
                  <td className="px-2 py-2 text-gray-700">{c.montant} €</td>
                  <td className="px-2 py-2">
                    <EleveCotisationStatutSelect
                      cotisation={c}
                      eleveId={eleveId}
                    />
                  </td>
                  <td className="px-2 py-2 text-gray-600">
                    {c.paid_at ? formatDate(c.paid_at) : "—"}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <EleveDeleteCotisationButton
                      cotisationId={c.id}
                      eleveId={eleveId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
