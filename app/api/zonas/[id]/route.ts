import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// PUT /api/zonas/:id -> edita una zona  body: { nombre }
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const zonaId = Number(id);
    if (Number.isNaN(zonaId)) return apiError("id invalido", 400);

    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { nombre } = body as { nombre?: string };
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return apiError("El campo 'nombre' es obligatorio", 400);
    }

    const zona = await prisma.zona.update({
      where: { id: zonaId },
      data: { nombre: nombre.trim() },
      select: { id: true, nombre: true },
    });
    return json(zona);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") return apiError("Ya existe una zona con ese nombre", 409);
    if (code === "P2025") return apiError("Zona no encontrada", 404);
    console.error("PUT /api/zonas/:id", e);
    return apiError("No se pudo actualizar la zona", 500);
  }
}

// DELETE /api/zonas/:id -> elimina la zona (si no tiene reportes)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const zonaId = Number(id);
    if (Number.isNaN(zonaId)) return apiError("id invalido", 400);

    await prisma.zona.delete({ where: { id: zonaId } });
    return json({ ok: true });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2003") {
      return apiError("No se puede eliminar: la zona tiene reportes asociados", 409);
    }
    if (code === "P2025") return apiError("Zona no encontrada", 404);
    console.error("DELETE /api/zonas/:id", e);
    return apiError("No se pudo eliminar la zona", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
