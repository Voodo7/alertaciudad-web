import { prisma } from "@/lib/prisma";
import {
  json,
  apiError,
  preflight,
  serializeReporte,
  reporteInclude,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// PATCH /api/reportes/:id/estado -> { idEstado, comentario }
// Actualiza el estado del reporte y agrega un registro a HistorialReporte.
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

    const { idEstado, comentario } = body as {
      idEstado?: number | string;
      comentario?: string;
    };
    if (idEstado == null) {
      return apiError("El campo 'idEstado' es obligatorio", 400);
    }
    const estadoId = Number(idEstado);
    if (Number.isNaN(estadoId)) return apiError("idEstado invalido", 400);

    const [reporte, estado] = await Promise.all([
      prisma.reporte.findUnique({ where: { id: reporteId } }),
      prisma.estadoReporte.findUnique({ where: { id: estadoId } }),
    ]);
    if (!reporte) return apiError("Reporte no encontrado", 404);
    if (!estado) return apiError("Estado no encontrado", 404);

    // Transaccion: actualizar estado + registrar historial.
    const [actualizado] = await prisma.$transaction([
      prisma.reporte.update({
        where: { id: reporteId },
        data: { estadoId },
        include: reporteInclude,
      }),
      prisma.historialReporte.create({
        data: {
          reporteId,
          estadoId,
          comentario: comentario ?? null,
        },
      }),
    ]);

    return json(serializeReporte(actualizado));
  } catch (e) {
    console.error("PATCH /api/reportes/:id/estado", e);
    return apiError("No se pudo actualizar el estado", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
