"use client";

import { updateNotes } from "@/app/eleves/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = { eleveId: string; initialNotes: string | null };

export default function EleveNotesEditor({
  eleveId,
  initialNotes,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialNotes ?? "");

  useEffect(() => {
    setDraft(initialNotes ?? "");
  }, [initialNotes]);

  async function handleBlur() {
    setEditing(false);
    await updateNotes(eleveId, draft);
    router.refresh();
  }

  const empty = !initialNotes?.trim();

  if (editing) {
    return (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        rows={4}
        autoFocus
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:border-gray-500 focus:outline-none"
      />
    );
  }

  if (empty) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-left text-sm italic text-gray-400 hover:text-gray-600"
      >
        Ajouter une note…
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full text-left"
    >
      <p className="text-sm text-gray-600">{initialNotes}</p>
    </button>
  );
}
