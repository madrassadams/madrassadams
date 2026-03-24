"use client";

import { updateNiveau } from "@/app/eleves/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { eleveId: string; initialNiveau: number };

export default function EleveNiveauEditor({
  eleveId,
  initialNiveau,
}: Props) {
  const router = useRouter();
  const [niveau, setNiveau] = useState(initialNiveau);

  async function setStar(i: number) {
    const previous = niveau;
    setNiveau(i);
    try {
      await updateNiveau(eleveId, i);
      router.refresh();
    } catch {
      setNiveau(previous);
    }
  }

  return (
    <div className="flex gap-1" role="group" aria-label="Niveau">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => setStar(i)}
          className="cursor-pointer text-xl text-amber-500"
        >
          {i <= niveau ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
