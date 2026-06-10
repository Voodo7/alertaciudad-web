import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// PUT /api/categorias/:id -> edita una categoria  body: { nombre?, icono? }
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoriaId = Number(id);
    if (Number.isNaN(categoriaId)) return apiError("id invalido", 400);

    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { nombre, icono } = body as { nombre?: string; icono?: string | null };
    const data: Record<string, unknown> = {};
    if (typeof nombre === "string" && nombre.trim()) data.nombre = nombre.trim();
    if (icono !== undefined) data.icono = icono?.trim() || null;
    if (Object.keys(data).length === 0) {
      return apiError("No hay campos para actualizar", 400);
    }

    const categoria = await prisma.categoria.update({
      where: { id: categoriaId },
      data,
      select: { id: true, nombre: true, icono: true },
    });
    return json(categoria);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") return apiError("Ya existe una categoria con ese nombre", 409);
    if (code === "P2025") return apiError("Categoria no encontrada", 404);
    console.error("PUT /api/categorias/:id", e);
    return apiError("No se pudo actualizar la categoria", 500);
  }
}

// DELETE /api/categorias/:id -> elimina la categoria (si no tiene reportes)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoriaId = Number(id);
    if (Number.isNaN(categoriaId)) return apiError("id invalido", 400);

    await prisma.categoria.delete({ where: { id: categoriaId } });
    return json({ ok: true });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2003") {
      return apiError("No se puede eliminar: la categoria tiene reportes asociados", 409);
    }
    if (code === "P2025") return apiError("Categoria no encontrada", 404);
    console.error("DELETE /api/categorias/:id", e);
    return apiError("No se pudo eliminar la categoria", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
