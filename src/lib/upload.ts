import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error?: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: "", error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" };
  }
  if (file.size > MAX_SIZE) {
    return { url: "", error: "File too large. Maximum 5MB" };
  }

  const ext = file.name.split(".").pop();
  const filename = `${path}/${crypto.randomUUID()}.${ext}`;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type });

  if (error) return { url: "", error: error.message };

  const { data: urlData } = adminClient.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}
