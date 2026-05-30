"use client";

import { useActionState, useEffect, useState } from "react";
import type { Eleve } from "@/types";
import Link from "next/link";
import PhoneField from "@/components/PhoneInput";

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";

type Props = {
  action: (prevState: unknown, formData: FormData) => Promise<unknown>;
  defaultValues?: Partial<Eleve>;
};

export default function EleveForm({ action, defaultValues }: Props) {
  const [, formAction, pending] = useActionState(action, null);
  const [niveau, setNiveau] = useState(defaultValues?.niveau ?? 1);
  const [selectedCours, setSelectedCours] = useState<string[]>(
    defaultValues?.cours ?? [],
  );

  useEffect(() => {
    setNiveau(defaultValues?.niveau ?? 1);
    setSelectedCours(defaultValues?.cours ?? []);
  }, [defaultValues?.niveau, defaultValues?.cours]);

  const eleveId = defaultValues?.id;

  function toggleCours(value: string) {
    setSelectedCours((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value],
    );
  }

  return (
    <form action={formAction} className="mx-auto flex max-w-lg flex-col gap-5">
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

      {!eleveId && (
        <div className="flex flex-col gap-1">
          <label htmlFor="montant" className="text-sm font-medium text-gray-700">
            Cotisation du mois (€)
          </label>
          <input
            id="montant"
            name="montant"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex : 30"
            className={inputClass}
          />
          <span className="text-xs text-gray-400">
            Laissez vide pour ne pas créer de cotisation maintenant.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Téléphone
        </label>
        <PhoneField
          defaultValue={defaultValues?.telephone}
          name="telephone"
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
          disabled={pending}
          className={`w-full rounded bg-gray-900 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 ${
            pending ? "opacity-50" : "hover:bg-gray-700"
          }`}
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
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
