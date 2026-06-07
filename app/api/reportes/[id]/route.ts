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

export function OPTIONS() {
  return preflight();
}
