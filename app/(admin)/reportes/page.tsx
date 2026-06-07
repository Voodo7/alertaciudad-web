import { prisma } from "@/lib/prisma";
import { DbError } from "@/components/admin/db-error";
import { formatFecha } from "@/lib/utils";
import { ReportesClient, type ReporteRow } from "./reportes-client";
import type { FieldOption } from "@/components/admin/crud-resource";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  let rows: ReporteRow[];
  let categoriaOptions: FieldOption[];
  let zonaOptions: FieldOption[];
  let estadoOptions: FieldOption[];
  let usuarioOptions: FieldOption[];

  try {
    const [data, categorias, zonas, estados, usuarios] = await Promise.all([
      prisma.reporte.findMany({
        orderBy: { creadoEn: "desc" },
        include: {
          categoria: { select: { nombre: true } },
          zona: { select: { nombre: true } },
          estado: { select: { nombre: true } },
          usuario: { select: { nombre: true } },
        },
      }),
      prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
      prisma.zona.findMany({ orderBy: { nombre: "asc" } }),
      prisma.estadoReporte.findMany({ orderBy: { id: "asc" } }),
      prisma.usuario.findMany({ orderBy: { nombre: "asc" } }),
    ]);

    rows = data.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      descripcion: r.descripcion,
      fotoUrl: r.fotoUrl,
      lat: r.lat,
      lng: r.lng,
      categoriaId: r.categoriaId,
      zonaId: r.zonaId,
      estadoId: r.estadoId,
      usuarioId: r.usuarioId,
      categoriaNombre: r.categoria?.nombre ?? "—",
      zonaNombre: r.zona?.nombre ?? "Sin zona",
      estadoNombre: r.estado?.nombre ?? "—",
      usuarioNombre: r.usuario?.nombre ?? "—",
      creadoEn: formatFecha(r.creadoEn),
    }));

    categoriaOptions = categorias.map((c) => ({ value: c.id, label: c.nombre }));
    zonaOptions = zonas.map((z) => ({ value: z.id, label: z.nombre }));
    estadoOptions = estados.map((e) => ({ value: e.id, label: e.nombre }));
    usuarioOptions = usuarios.map((u) => ({ value: u.id, label: u.nombre }));
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  return (
    <ReportesClient
      rows={rows}
      categoriaOptions={categoriaOptions}
      zonaOptions={zonaOptions}
      estadoOptions={estadoOptions}
      usuarioOptions={usuarioOptions}
    />
  );
}
