import { prisma } from "@/lib/prisma";
import { DbError } from "@/components/admin/db-error";
import { CategoriasClient, type CategoriaRow } from "./categorias-client";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  let rows: CategoriaRow[];
  try {
    const data = await prisma.categoria.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { reportes: true } } },
    });
    rows = data.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      icono: c.icono,
      reportes: c._count.reportes,
    }));
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  return <CategoriasClient rows={rows} />;
}
