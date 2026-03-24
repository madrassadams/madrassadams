"use client";

import { generateCotisations as runGenerateCotisations } from "@/app/cotisations/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "defaultMontant";

type Props = {
  mois: string;
};

export default function GenerateCotisations({ mois }: Props) {
  const router = useRouter();
  const [montant, setMontant] = useState(50);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) setMontant(n);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(montant));
    } catch {
      /* ignore */
    }
  }, [montant]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    try {
      const res = await runGenerateCotisations(mois, montant);
      setMessage(
        res.created > 0
          ? `${res.created} cotisation${res.created > 1 ? "s" : ""} créée${res.created > 1 ? "s" : ""}`
          : "Toutes les cotisations existent déjà",
      );
      router.refresh();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Une erreur est survenue",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="default-montant"
            className="text-sm font-medium text-gray-700"
          >
            Montant par défaut
          </label>
          <input
            id="default-montant"
            type="number"
            step="0.01"
            min="0.01"
            value={montant}
            onChange={(e) => setMontant(Number(e.target.value))}
            className="w-32 rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          Générer les cotisations manquantes
        </button>
      </form>
      {message ? (
        <p className="mt-3 text-sm text-gray-600" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
