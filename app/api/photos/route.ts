import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { uploadBuffer } from "@/lib/cloudinary";
import { FieldValue } from "firebase-admin/firestore";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function GET() {
  const snap = await adminDb.collection("photos").orderBy("createdAt", "desc").get();
  const photos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo");
  const uploadedBy = (formData.get("uploadedBy") as string | null)?.trim() || "Anonymous";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!(file as File).type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const { secure_url, public_id } = await uploadBuffer(buffer, { folder: "party-photos" });

  const ref = await adminDb.collection("photos").add({
    url: secure_url,
    publicId: public_id,
    uploadedBy,
    votes: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: ref.id, url: secure_url });
}
