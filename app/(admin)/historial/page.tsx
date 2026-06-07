import { prisma } from "@/lib/prisma";
import { DbError } from "@/components/admin/db-error";
import { formatFecha } from "@/lib/utils";
import { HistorialClient, type HistorialRow } from "./historial-client";
import type { FieldOption } from "@/components/admin/crud-resource";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  let rows: HistorialRow[];
  let reporteOptions: FieldOption[];
  let estadoOptions: FieldOption[];
  try {
    const [data, reportes, estados] = await Promise.all([
      prisma.historialReporte.findMany({
        orderBy: { creadoEn: "desc" },
        include: {
          estado: { select: { nombre: true } },
          reporte: { select: { titulo: true } },
        },
      }),
      prisma.reporte.findMany({ orderBy: { id: "asc" }, select: { id: true, titulo: true } }),
      prisma.estadoReporte.findMany({ orderBy: { id: "asc" } }),
    ]);

    rows = data.map((h) => ({
      id: h.id,
      reporteId: h.reporteId,
      reporteTitulo: h.reporte?.titulo ?? `#${h.reporteId}`,
      estadoId: h.estadoId,
      estadoNombre: h.estado?.nombre ?? "—",
      comentario: h.comentario,
      creadoEn: formatFecha(h.creadoEn),
    }));

    reporteOptions = reportes.map((r) => ({ value: r.id, label: `#${r.id} · ${r.titulo}` }));
    estadoOptions = estados.map((e) => ({ value: e.id, label: e.nombre }));
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  return (
    <HistorialClient
      rows={rows}
      reporteOptions={reporteOptions}
      estadoOptions={estadoOptions}
    />
  );
}
