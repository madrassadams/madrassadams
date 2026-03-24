"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const templateSchema = z.object({
  titre: z.string().min(1),
  contenu: z.string().min(1),
});

function parseTemplateForm(formData: FormData) {
  const titre = String(formData.get("titre") ?? "").trim();
  const contenu = String(formData.get("contenu") ?? "").trim();
  const result = templateSchema.safeParse({ titre, contenu });
  if (!result.success) {
    throw new Error(
      result.error.issues[0]?.message ?? "Données invalides",
    );
  }
  return result.data;
}

export async function createTemplate(formData: FormData): Promise<void> {
  const data = parseTemplateForm(formData);
  const supabase = await createServerClient();
  const { error } = await supabase.from("message_templates").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/messages");
}

export async function updateTemplate(
  id: string,
  formData: FormData,
): Promise<void> {
  const data = parseTemplateForm(formData);
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("message_templates")
    .update(data)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/messages");
}

export async function deleteTemplate(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/messages");
}
