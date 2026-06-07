import { getFirestoreAdmin } from "@/lib/firebaseAdmin";
import { json, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// DIAGNÓSTICO TEMPORAL: confirma que el Admin SDK está configurado y lee las
// últimas notificaciones escritas en Firestore. (Se elimina tras verificar.)
export async function GET() {
  const db = getFirestoreAdmin();
  if (!db) {
    return json({ adminConfigured: false, error: "Faltan credenciales FIREBASE_*" });
  }
  try {
    const snap = await db
      .collection("notificaciones")
      .orderBy("creadoEn", "desc")
      .limit(5)
      .get();
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return json({ adminConfigured: true, count: snap.size, latest: docs });
  } catch (e) {
    return json({
      adminConfigured: true,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

export function OPTIONS() {
  return preflight();
}
