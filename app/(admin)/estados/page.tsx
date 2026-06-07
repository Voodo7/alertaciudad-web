import { prisma } from "@/lib/prisma";
import { DbError } from "@/components/admin/db-error";
import { EstadosClient, type EstadoRow } from "./estados-client";

export const dynamic = "force-dynamic";

export default async function EstadosPage() {
  let rows: EstadoRow[];
  try {
    const data = await prisma.estadoReporte.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { reportes: true } } },
    });
    rows = data.map((e) => ({ id: e.id, nombre: e.nombre, reportes: e._count.reportes }));
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  return <EstadosClient rows={rows} />;
}
