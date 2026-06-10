import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// PUT /api/estados/:id -> edita un estado de reporte  body: { nombre }
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const estadoId = Number(id);
    if (Number.isNaN(estadoId)) return apiError("id invalido", 400);

    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { nombre } = body as { nombre?: string };
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return apiError("El campo 'nombre' es obligatorio", 400);
    }

    const estado = await prisma.estadoReporte.update({
      where: { id: estadoId },
      data: { nombre: nombre.trim() },
      select: { id: true, nombre: true },
    });
    return json(estado);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") return apiError("Ya existe un estado con ese nombre", 409);
    if (code === "P2025") return apiError("Estado no encontrado", 404);
    console.error("PUT /api/estados/:id", e);
    return apiError("No se pudo actualizar el estado", 500);
  }
}

// DELETE /api/estados/:id -> elimina el estado (si ningun reporte lo usa)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const estadoId = Number(id);
    if (Number.isNaN(estadoId)) return apiError("id invalido", 400);

    await prisma.estadoReporte.delete({ where: { id: estadoId } });
    return json({ ok: true });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2003") {
      return apiError("No se puede eliminar: hay reportes o historial con este estado", 409);
    }
    if (code === "P2025") return apiError("Estado no encontrado", 404);
    console.error("DELETE /api/estados/:id", e);
    return apiError("No se pudo eliminar el estado", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
