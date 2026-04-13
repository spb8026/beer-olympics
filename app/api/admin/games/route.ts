import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, description, rules, gameType } = await req.json();
  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }

  // place new game after all existing ones
  const snap = await adminDb.collection("games").orderBy("order", "desc").limit(1).get();
  const maxOrder = snap.empty ? 0 : (snap.docs[0].data().order as number) ?? 0;

  const ref = await adminDb.collection("games").add({
    name: name.trim(),
    slug: slug.trim(),
    description: description?.trim() ?? "",
    rules: Array.isArray(rules) ? rules.filter((r: string) => r.trim()) : [],
    gameType: gameType ?? "team-bracket",
    order: maxOrder + 1,
  });

  return NextResponse.json({ id: ref.id });
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, description, rules, gameType } = await req.json();

  const update: Record<string, unknown> = { description, rules };
  if (gameType !== undefined) update.gameType = gameType;

  await adminDb.collection("games").doc(id).update(update);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await adminDb.collection("games").doc(id).delete();

  return NextResponse.json({ success: true });
}
