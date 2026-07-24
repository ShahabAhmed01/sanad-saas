import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || "uploads";
  const path = (formData.get("path") as string) || "general";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const result = await uploadFile(file, bucket, path);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ url: result.url });
}
