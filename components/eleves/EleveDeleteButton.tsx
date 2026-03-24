"use client";

import { deleteEleve } from "@/app/eleves/actions";

type Props = { eleveId: string };

export default function EleveDeleteButton({ eleveId }: Props) {
  async function handleClick() {
    if (!window.confirm("Supprimer définitivement cet élève ?")) return;
    await deleteEleve(eleveId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm text-red-600 hover:text-red-800"
    >
      Supprimer
    </button>
  );
}
