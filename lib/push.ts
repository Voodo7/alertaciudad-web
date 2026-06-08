import { getMessagingAdmin } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";

/**
 * Envía una notificación push (FCM) a todos los dispositivos del usuario.
 * Tolerante a fallos: si no hay Admin SDK o no hay tokens, no hace nada.
 * Elimina de la BD los tokens que el FCM reporte como inválidos/expirados.
 */
export async function enviarPush(params: {
  usuarioId: number;
  titulo: string;
  mensaje: string;
  reporteId?: number;
  estadoNombre?: string;
}): Promise<void> {
  const messaging = getMessagingAdmin();
  if (!messaging) return;

  let tokens: { token: string }[] = [];
  try {
    tokens = await prisma.dispositivoToken.findMany({
      where: { usuarioId: params.usuarioId },
      select: { token: true },
    });
  } catch (e) {
    console.error("[push] No se pudieron leer los tokens:", e);
    return;
  }
  if (tokens.length === 0) return;

  const tokenList = tokens.map((t) => t.token);

  try {
    const res = await messaging.sendEachForMulticast({
      tokens: tokenList,
      notification: { title: params.titulo, body: params.mensaje },
      android: {
        priority: "high",
        notification: { channelId: "estados_reportes" },
      },
      data: {
        reporteId: String(params.reporteId ?? ""),
        estado: params.estadoNombre ?? "",
      },
    });

    // Limpiar tokens inválidos/expirados.
    const invalidos: string[] = [];
    res.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error?.code ?? "";
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token" ||
          code === "messaging/invalid-argument"
        ) {
          invalidos.push(tokenList[i]);
        }
      }
    });
    if (invalidos.length > 0) {
      await prisma.dispositivoToken.deleteMany({ where: { token: { in: invalidos } } });
    }
  } catch (e) {
    console.error("[push] Error enviando FCM:", e);
  }
}
