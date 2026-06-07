import { prisma } from "@/lib/prisma";
import { DbError } from "@/components/admin/db-error";
import { formatFechaCorta } from "@/lib/utils";
import { AdministradoresClient, type AdminRow } from "./administradores-client";

export const dynamic = "force-dynamic";

export default async function AdministradoresPage() {
  let rows: AdminRow[];
  try {
    const data = await prisma.administrador.findMany({ orderBy: { id: "asc" } });
    rows = data.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      correo: a.correo,
      creadoEn: formatFechaCorta(a.creadoEn),
    }));
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  return <AdministradoresClient rows={rows} />;
}
