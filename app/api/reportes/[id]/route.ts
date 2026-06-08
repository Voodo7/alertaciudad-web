import { prisma } from "@/lib/prisma";
import {
  json,
  apiError,
  preflight,
  serializeReporte,
  reporteInclude,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/reportes/:id -> reporte + su historial
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reporteId = Number(id);
    if (Number.isNaN(reporteId)) return apiError("id invalido", 400);

    const reporte = await prisma.reporte.findUnique({
      where: { id: reporteId },
      include: {
        ...reporteInclude,
        historial: {
          orderBy: { creadoEn: "desc" },
          include: { estado: { select: { id: true, nombre: true } } },
        },
      },
    });

    if (!reporte) return apiError("Reporte no encontrado", 404);

    return json({
      ...serializeReporte(reporte),
      historial: reporte.historial.map((h) => ({
        id: h.id,
        estado: h.estado ? { id: h.estado.id, nombre: h.estado.nombre } : null,
        comentario: h.comentario,
        creadoEn: h.creadoEn,
      })),
    });
  } catch (e) {
    console.error("GET /api/reportes/:id", e);
    return apiError("No se pudo obtener el reporte", 500);
  }
}

// PATCH /api/reportes/:id -> edita campos del reporte (lo usa el dueño desde la app)
// body: { titulo?, descripcion?, fotoUrl?, idCategoria? }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reporteId = Number(id);
    if (Number.isNaN(reporteId)) return apiError("id invalido", 400);

    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { titulo, descripcion, fotoUrl, idCategoria } = body as {
      titulo?: string;
      descripcion?: string;
      fotoUrl?: string | null;
      idCategoria?: number | string;
    };

    const data: Record<string, unknown> = {};
    if (typeof titulo === "string" && titulo.trim()) data.titulo = titulo.trim();
    if (typeof descripcion === "string" && descripcion.trim())
      data.descripcion = descripcion.trim();
    if (fotoUrl !== undefined) data.fotoUrl = fotoUrl || null;
    if (idCategoria != null && !Number.isNaN(Number(idCategoria)))
      data.categoriaId = Number(idCategoria);

    if (Object.keys(data).length === 0) {
      return apiError("No hay campos para actualizar", 400);
    }

    const actualizado = await prisma.reporte.update({
      where: { id: reporteId },
      data,
      include: reporteInclude,
    });

    return json(serializeReporte(actualizado));
  } catch (e) {
    console.error("PATCH /api/reportes/:id", e);
    return apiError("No se pudo actualizar el reporte", 500);
  }
}

// DELETE /api/reportes/:id -> elimina el reporte (y su historial en cascada)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reporteId = Number(id);
    if (Number.isNaN(reporteId)) return apiError("id invalido", 400);

    await prisma.reporte.delete({ where: { id: reporteId } });
    return json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/reportes/:id", e);
    return apiError("No se pudo eliminar el reporte", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
