import { prisma } from "@/lib/prisma";
import { DbError } from "@/components/admin/db-error";
import { formatFechaCorta } from "@/lib/utils";
import { UsuariosClient, type UsuarioRow } from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  let rows: UsuarioRow[];
  try {
    const data = await prisma.usuario.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { reportes: true } } },
    });
    rows = data.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      correo: u.correo,
      firebaseUid: u.firebaseUid,
      creadoEn: formatFechaCorta(u.creadoEn),
      reportes: u._count.reportes,
    }));
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  return <UsuariosClient rows={rows} />;
}
