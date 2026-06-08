import { getFirestoreAdmin } from "@/lib/firebaseAdmin";
import { enviarPush } from "@/lib/push";

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
  const titulo = `Tu reporte cambió a ${params.estadoNombre}`;
  const mensaje =
    params.comentario && params.comentario.trim()
      ? params.comentario.trim()
      : `"${params.reporteTitulo}" ahora está en estado ${params.estadoNombre}.`;

  // 1. Documento en Firestore (banner en tiempo real dentro de la app).
  const db = getFirestoreAdmin();
  if (db) {
    try {
      await db.collection("notificaciones").add({
        usuarioId: params.usuarioId, // número: la app filtra por whereEqualTo("usuarioId", id)
        reporteId: params.reporteId,
        titulo,
        mensaje,
        creadoEn: Date.now(), // epoch ms (la app lee getLong("creadoEn"))
        leida: false,
      });
    } catch (e) {
      console.error("[notificaciones] No se pudo escribir en Firestore:", e);
    }
  }

  // 2. Push FCM (llega aunque la app esté cerrada).
  await enviarPush({
    usuarioId: params.usuarioId,
    titulo,
    mensaje,
    reporteId: params.reporteId,
    estadoNombre: params.estadoNombre,
  });
}
