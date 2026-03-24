"use client";

import {
  buildWhatsAppUrl,
  currentMoisISO,
  formatMois,
  replaceTemplateVars,
} from "@/lib/utils";
import type { Cotisation, Eleve, MessageTemplate } from "@/types";
import { useMemo, useState } from "react";

type Props = {
  eleve: Eleve;
  cotisations: Cotisation[];
  templates: MessageTemplate[];
};

export default function EleveWhatsAppSender({
  eleve,
  cotisations,
  templates,
}: Props) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");

  const selected = templates.find((t) => t.id === templateId) ?? templates[0];

  const refCotisation = useMemo(
    () => cotisations.find((c) => c.statut !== "paye"),
    [cotisations],
  );

  const previewText = useMemo(() => {
    if (!selected) return "";
    return replaceTemplateVars(selected.contenu, {
      prenom: eleve.prenom,
      nom: eleve.nom,
      montant: refCotisation?.montant?.toString() ?? "—",
      mois: formatMois(refCotisation?.mois ?? currentMoisISO()),
      cours: eleve.cours.join(", "),
    });
  }, [selected, eleve, refCotisation]);

  if (templates.length === 0) {
    return (
      <p className="text-sm text-gray-500">Aucun modèle de message.</p>
    );
  }

  if (!eleve.telephone) return null;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700" htmlFor="wa-template">
        Modèle
      </label>
      <select
        id="wa-template"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        className="max-w-md rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.titre}
          </option>
        ))}
      </select>
      <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-700">
        {previewText || "—"}
      </div>
      <a
        href={buildWhatsAppUrl(eleve.telephone, previewText)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
      >
        Ouvrir WhatsApp ↗
      </a>
    </div>
  );
}
