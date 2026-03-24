"use client";

import { createCotisation } from "@/app/eleves/actions";
import { useRouter } from "next/navigation";

type Props = { eleveId: string; defaultMonth: string };

export default function EleveAddCotisationForm({
  eleveId,
  defaultMonth,
}: Props) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    await createCotisation(eleveId, formData);
    router.refresh();
  }

  return (
    <form
      action={handleSubmit}
      className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="cot-mois" className="text-xs text-gray-500">
          Mois
        </label>
        <input
          id="cot-mois"
          name="mois"
          type="month"
          defaultValue={defaultMonth}
          required
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="cot-montant" className="text-xs text-gray-500">
          Montant
        </label>
        <input
          id="cot-montant"
          name="montant"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="50"
          required
          className="w-28 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="cot-statut" className="text-xs text-gray-500">
          Statut
        </label>
        <select
          id="cot-statut"
          name="statut"
          required
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="en_attente">En attente</option>
          <option value="paye">Payé</option>
          <option value="retard">Retard</option>
        </select>
      </div>
      <button
        type="submit"
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        Ajouter
      </button>
    </form>
  );
}
