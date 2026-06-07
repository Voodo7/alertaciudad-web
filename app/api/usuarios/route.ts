import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/usuarios -> registra/sincroniza un usuario
// body: { nombre, correo, firebaseUid }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { nombre, correo, firebaseUid } = body as {
      nombre?: string;
      correo?: string;
      firebaseUid?: string;
    };

    if (!correo || typeof correo !== "string") {
      return apiError("El campo 'correo' es obligatorio", 400);
    }
    if (!nombre || typeof nombre !== "string") {
      return apiError("El campo 'nombre' es obligatorio", 400);
    }

    const correoNorm = correo.trim().toLowerCase();

    // Upsert por correo: si existe lo sincroniza, si no lo crea.
    const usuario = await prisma.usuario.upsert({
      where: { correo: correoNorm },
      update: {
        nombre,
        ...(firebaseUid ? { firebaseUid } : {}),
      },
      create: {
        nombre,
        correo: correoNorm,
        firebaseUid: firebaseUid ?? null,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        firebaseUid: true,
        creadoEn: true,
      },
    });

    return json(usuario, { status: 200 });
  } catch (e) {
    console.error("POST /api/usuarios", e);
    return apiError("No se pudo registrar el usuario", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
