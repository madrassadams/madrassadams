"use client";

import { createEleve, updateEleve } from "@/app/eleves/actions";
import type { Eleve } from "@/types";
import Link from "next/link";
import { useState } from "react";

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";

type Props = {
  defaultValues?: Partial<Eleve>;
  action: "create" | "edit";
  eleveId?: string;
};

export default function EleveForm({
  defaultValues,
  action,
  eleveId,
}: Props) {
  const [niveau, setNiveau] = useState(defaultValues?.niveau ?? 1);
  const [selectedCours, setSelectedCours] = useState<string[]>(
    defaultValues?.cours ?? [],
  );

  const boundUpdate =
    action === "edit" && eleveId
      ? updateEleve.bind(null, eleveId)
      : undefined;

  function toggleCours(value: string) {
    setSelectedCours((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value],
    );
  }

  return (
    <form
      action={action === "create" ? createEleve : boundUpdate}
      className="mx-auto flex max-w-lg flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="prenom" className="text-sm font-medium text-gray-700">
          Prénom
        </label>
        <input
          id="prenom"
          name="prenom"
          type="text"
          required
          defaultValue={defaultValues?.prenom ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="nom" className="text-sm font-medium text-gray-700">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          defaultValue={defaultValues?.nom ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Cours</span>
        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="cours"
              value="arabe"
              checked={selectedCours.includes("arabe")}
              onChange={() => toggleCours("arabe")}
              className="rounded border-gray-300"
            />
            Arabe
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="cours"
              value="coran"
              checked={selectedCours.includes("coran")}
              onChange={() => toggleCours("coran")}
              className="rounded border-gray-300"
            />
            Coran
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Niveau</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => setNiveau(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setNiveau(i);
                }
              }}
              className="cursor-pointer text-xl text-amber-500"
            >
              {i <= niveau ? "★" : "☆"}
            </span>
          ))}
        </div>
        <input type="hidden" name="niveau" value={niveau} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="telephone" className="text-sm font-medium text-gray-700">
          Téléphone
        </label>
        <input
          id="telephone"
          name="telephone"
          type="text"
          placeholder="+33 6 12 34 56 78"
          defaultValue={defaultValues?.telephone ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          className="w-full rounded bg-gray-900 py-2 text-sm text-white"
        >
          Enregistrer
        </button>
        <Link
          href={eleveId ? `/eleves/${eleveId}` : "/eleves"}
          className="text-center text-sm text-gray-500 underline"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
