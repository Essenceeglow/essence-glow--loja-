import { supabase } from "./supabaseClient";

// Nome do "espaço" (bucket) dentro do Supabase Storage onde as fotos ficam guardadas.
// Precisa existir no painel do Supabase antes de usar (Storage > New bucket > "product-images", marcado como Public).
const BUCKET_NAME = "product-images";

/**
 * Faz upload de um arquivo de imagem para o Supabase Storage e retorna a URL pública dele.
 * Usado no admin para trocar o "colar link" por "escolher arquivo do computador".
 */
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop() || "jpg";
  const randomName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
  const filePath = randomName;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Falha ao enviar a imagem: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}
