"use client";

import { deleteCotisation } from "@/app/eleves/actions";
import { useRouter } from "next/navigation";

type Props = { cotisationId: string; eleveId: string };

export default function EleveDeleteCotisationButton({
  cotisationId,
  eleveId,
}: Props) {
  const router = useRouter();

  async function handleClick() {
    if (!window.confirm("Supprimer cette cotisation ?")) return;
    await deleteCotisation(cotisationId, eleveId);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-lg leading-none text-gray-400 hover:text-red-600"
      aria-label="Supprimer"
    >
      ×
    </button>
  );
}
