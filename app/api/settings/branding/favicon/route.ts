import { NextResponse } from "next/server";

import { requireStaffSession } from "@/lib/auth/server-session";
import { uploadBrandingFaviconAdmin } from "@/lib/firebase/admin-storage";

/** POST: upload the portal favicon to Firebase Storage. */
export async function POST(request: Request) {
  const user = await requireStaffSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  const isIco =
    file.name.toLowerCase().endsWith(".ico") ||
    file.type === "image/x-icon" ||
    file.type === "image/vnd.microsoft.icon";

  if (!file.type.startsWith("image/") && !isIco) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const faviconUrl = await uploadBrandingFaviconAdmin(buffer, file.type, file.name);
    return NextResponse.json({ faviconUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    const status = message.includes("5 MB") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
