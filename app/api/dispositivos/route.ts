import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/dispositivos -> registra/actualiza el token FCM de un dispositivo
// body: { usuarioId, token }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { usuarioId, token } = body as { usuarioId?: number | string; token?: string };
    if (usuarioId == null) return apiError("El campo 'usuarioId' es obligatorio", 400);
    if (!token || typeof token !== "string") {
      return apiError("El campo 'token' es obligatorio", 400);
    }
    const uid = Number(usuarioId);
    if (Number.isNaN(uid)) return apiError("usuarioId invalido", 400);

    // Upsert por token: si el token ya existe lo reasigna al usuario actual.
    await prisma.dispositivoToken.upsert({
      where: { token },
      update: { usuarioId: uid },
      create: { token, usuarioId: uid },
    });

    return json({ ok: true });
  } catch (e) {
    console.error("POST /api/dispositivos", e);
    return apiError("No se pudo registrar el dispositivo", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
