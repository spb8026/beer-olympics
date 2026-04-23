import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const VALID_CATEGORIES = ["Appetizer", "Main Dish", "Side", "Dessert", "Drinks", "Other"];

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function GET() {
  const snap = await adminDb
    .collection("potluck")
    .orderBy("createdAt", "asc")
    .get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { name, item, category } = await req.json();
  if (!name?.trim() || !item?.trim()) {
    return NextResponse.json({ error: "Name and item are required" }, { status: 400 });
  }
  const cat = VALID_CATEGORIES.includes(category) ? category : "Other";
  const ref = await adminDb.collection("potluck").add({
    name: name.trim(),
    item: item.trim(),
    category: cat,
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: ref.id });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await adminDb.collection("potluck").doc(id).delete();
  return NextResponse.json({ success: true });
}
