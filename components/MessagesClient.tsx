"use client";

import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from "@/app/messages/actions";
import {
  buildWhatsAppUrl,
  currentMoisISO,
  formatMois,
  getStatutLabel,
  replaceTemplateVars,
} from "@/lib/utils";
import type {
  CoursType,
  EleveWithCotisation,
  MessageTemplate,
  StatutCotisation,
} from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Tab = "modeles" | "envoyer";

type Props = {
  templates: MessageTemplate[];
  eleves: EleveWithCotisation[];
};

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}

type EditingId = string | null;

export default function MessagesClient({ templates, eleves }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("modeles");
  const [editingId, setEditingId] = useState<EditingId>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates[0]?.id ?? "",
  );
  const [coursFilter, setCoursFilter] = useState<"all" | CoursType>("all");
  const [statutFilter, setStatutFilter] = useState<
    "all" | "retard" | "en_attente"
  >("all");

  useEffect(() => {
    if (
      templates.length > 0 &&
      !templates.some((t) => t.id === selectedTemplateId)
    ) {
      setSelectedTemplateId(templates[0]!.id);
    }
  }, [templates, selectedTemplateId]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const filteredEleves = useMemo(() => {
    return eleves.filter((e) => {
      if (coursFilter !== "all" && !e.cours.includes(coursFilter)) {
        return false;
      }
      if (statutFilter === "all") return true;
      return e.cotisation_mois?.statut === statutFilter;
    });
  }, [eleves, coursFilter, statutFilter]);

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer ce modèle ?")) return;
    await deleteTemplate(id);
    if (selectedTemplateId === id) {
      setSelectedTemplateId(templates.find((t) => t.id !== id)?.id ?? "");
    }
    if (editingId === id) setEditingId(null);
    router.refresh();
  }

  async function handleTemplateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editingId === "new") {
      await createTemplate(fd);
    } else if (editingId) {
      await updateTemplate(editingId, fd);
    }
    setEditingId(null);
    router.refresh();
  }

  function previewVars(eleve: EleveWithCotisation): Record<string, string> {
    const c = eleve.cotisation_mois;
    return {
      prenom: eleve.prenom,
      nom: eleve.nom,
      montant: c?.montant != null ? String(c.montant) : "—",
      mois: formatMois(c?.mois ?? currentMoisISO()),
      cours: eleve.cours.join(", "),
    };
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Messages</h1>

      <div className="mb-6 flex gap-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("modeles")}
          className={`pb-2 text-sm ${
            tab === "modeles"
              ? "border-b-2 border-[#111] font-medium text-gray-900"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Modèles
        </button>
        <button
          type="button"
          onClick={() => setTab("envoyer")}
          className={`pb-2 text-sm ${
            tab === "envoyer"
              ? "border-b-2 border-[#111] font-medium text-gray-900"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Envoyer
        </button>
      </div>

      {tab === "modeles" ? (
        <div>
          {templates.map((t) => (
            <div
              key={t.id}
              className="mb-3 rounded-lg border border-gray-200 p-4"
            >
              {editingId === t.id ? (
                <form onSubmit={handleTemplateSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor={`titre-${t.id}`}
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Titre
                    </label>
                    <input
                      id={`titre-${t.id}`}
                      name="titre"
                      required
                      defaultValue={t.titre}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`contenu-${t.id}`}
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Contenu
                    </label>
                    <textarea
                      id={`contenu-${t.id}`}
                      name="contenu"
                      required
                      rows={4}
                      defaultValue={t.contenu}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Variables : {"{prenom}"} {"{nom}"} {"{montant}"}{" "}
                    {"{mois}"} {"{cours}"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-sm text-gray-500 underline"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mb-2 font-medium text-gray-900">{t.titre}</div>
                  <p className="mb-3 text-sm text-gray-500">
                    {truncate(t.contenu, 80)}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingId(t.id)}
                      className="text-sm text-gray-600 underline hover:text-gray-900"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {editingId === "new" ? (
            <form
              onSubmit={handleTemplateSubmit}
              className="mb-3 space-y-3 rounded-lg border border-gray-200 p-4"
            >
              <div>
                <label
                  htmlFor="titre-new"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Titre
                </label>
                <input
                  id="titre-new"
                  name="titre"
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="contenu-new"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Contenu
                </label>
                <textarea
                  id="contenu-new"
                  name="contenu"
                  required
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-400">
                Variables : {"{prenom}"} {"{nom}"} {"{montant}"} {"{mois}"}{" "}
                {"{cours}"}
              </p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm text-gray-500 underline"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : null}

          <button
            type="button"
            onClick={() => setEditingId("new")}
            disabled={editingId !== null}
            className="text-sm text-gray-700 underline hover:text-gray-900 disabled:opacity-40"
          >
            Nouveau modèle
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="tpl-select" className="text-xs text-gray-500">
                Modèle
              </label>
              <select
                id="tpl-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                {templates.length === 0 ? (
                  <option value="">Aucun modèle</option>
                ) : (
                  templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.titre}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="cours-f" className="text-xs text-gray-500">
                Cours
              </label>
              <select
                id="cours-f"
                value={coursFilter}
                onChange={(e) =>
                  setCoursFilter(e.target.value as "all" | CoursType)
                }
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                <option value="all">Tous</option>
                <option value="arabe">Arabe</option>
                <option value="coran">Coran</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="statut-f" className="text-xs text-gray-500">
                Statut
              </label>
              <select
                id="statut-f"
                value={statutFilter}
                onChange={(e) =>
                  setStatutFilter(
                    e.target.value as "all" | "retard" | "en_attente",
                  )
                }
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                <option value="all">Tous</option>
                <option value="retard">En retard</option>
                <option value="en_attente">En attente</option>
              </select>
            </div>
          </div>

          {!selectedTemplate ? (
            <p className="text-sm text-gray-500">
              Créez un modèle dans l’onglet Modèles pour prévisualiser les
              messages.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Élève</th>
                    <th className="px-4 py-3">Cours</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Aperçu</th>
                    <th className="px-4 py-3">WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEleves.map((eleve) => {
                    const fullPreview = replaceTemplateVars(
                      selectedTemplate.contenu,
                      previewVars(eleve),
                    );
                    const previewShort = truncate(fullPreview, 60);
                    const hasPhone = Boolean(eleve.telephone?.trim());
                    const st = eleve.cotisation_mois?.statut as
                      | StatutCotisation
                      | undefined;

                    return (
                      <tr
                        key={eleve.id}
                        className={hasPhone ? "" : "opacity-40"}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {eleve.prenom} {eleve.nom}
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
                          {st ? getStatutLabel(st) : "—"}
                        </td>
                        <td className="max-w-xs px-4 py-3 text-gray-600">
                          {previewShort}
                        </td>
                        <td className="px-4 py-3">
                          {hasPhone && eleve.telephone ? (
                            <a
                              href={buildWhatsAppUrl(
                                eleve.telephone,
                                fullPreview,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-700 hover:underline"
                            >
                              WA ↗
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300">
                              Pas de numéro
                            </span>
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
      )}
    </div>
  );
}
