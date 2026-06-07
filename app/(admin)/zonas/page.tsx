import { prisma } from "@/lib/prisma";
import { DbError } from "@/components/admin/db-error";
import { ZonasClient, type ZonaRow } from "./zonas-client";

export const dynamic = "force-dynamic";

export default async function ZonasPage() {
  let rows: ZonaRow[];
  try {
    const data = await prisma.zona.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { reportes: true } } },
    });
    rows = data.map((z) => ({ id: z.id, nombre: z.nombre, reportes: z._count.reportes }));
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  return <ZonasClient rows={rows} />;
}
