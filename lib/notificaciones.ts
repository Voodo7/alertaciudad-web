import { getFirestoreAdmin } from "@/lib/firebaseAdmin";

/**
 * Escribe un documento de notificación en Firestore (colección "notificaciones")
 * dirigido al usuario dueño del reporte. La app móvil lo escucha en tiempo real.
 *
 * Es tolerante a fallos: si el Admin SDK no está configurado o Firestore falla,
 * NO interrumpe el cambio de estado del reporte.
 */
export async function notificarCambioEstado(params: {
  usuarioId: number;
  reporteId: number;
  reporteTitulo: string;
  estadoNombre: string;
  comentario?: string | null;
}): Promise<void> {
  const db = getFirestoreAdmin();
  if (!db) return;

  try {
    await db.collection("notificaciones").add({
      usuarioId: params.usuarioId, // número: la app filtra por whereEqualTo("usuarioId", id)
      reporteId: params.reporteId,
      titulo: `Tu reporte cambió a ${params.estadoNombre}`,
      mensaje:
        params.comentario && params.comentario.trim()
          ? params.comentario.trim()
          : `"${params.reporteTitulo}" ahora está en estado ${params.estadoNombre}.`,
      creadoEn: Date.now(), // epoch ms (la app lee getLong("creadoEn"))
      leida: false,
    });
  } catch (e) {
    console.error("[notificaciones] No se pudo escribir en Firestore:", e);
  }
}
