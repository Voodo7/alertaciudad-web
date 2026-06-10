import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// PUT /api/usuarios/:id -> edita un usuario  body: { nombre?, correo? }
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuarioId = Number(id);
    if (Number.isNaN(usuarioId)) return apiError("id invalido", 400);

    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { nombre, correo } = body as { nombre?: string; correo?: string };
    const data: Record<string, unknown> = {};
    if (typeof nombre === "string" && nombre.trim()) data.nombre = nombre.trim();
    if (typeof correo === "string" && correo.trim()) {
      data.correo = correo.trim().toLowerCase();
    }
    if (Object.keys(data).length === 0) {
      return apiError("No hay campos para actualizar", 400);
    }

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data,
      select: { id: true, nombre: true, correo: true, creadoEn: true },
    });
    return json(usuario);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") return apiError("Ya existe un usuario con ese correo", 409);
    if (code === "P2025") return apiError("Usuario no encontrado", 404);
    console.error("PUT /api/usuarios/:id", e);
    return apiError("No se pudo actualizar el usuario", 500);
  }
}

// DELETE /api/usuarios/:id -> elimina el usuario (si no tiene reportes)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuarioId = Number(id);
    if (Number.isNaN(usuarioId)) return apiError("id invalido", 400);

    await prisma.usuario.delete({ where: { id: usuarioId } });
    return json({ ok: true });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2003") {
      return apiError("No se puede eliminar: el usuario tiene reportes asociados", 409);
    }
    if (code === "P2025") return apiError("Usuario no encontrado", 404);
    console.error("DELETE /api/usuarios/:id", e);
    return apiError("No se pudo eliminar el usuario", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
