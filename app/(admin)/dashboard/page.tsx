import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle2,
  Tags,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/admin/estado-badge";
import { DbError } from "@/components/admin/db-error";
import { formatFecha } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getData() {
  const [total, porEstado, porCategoria, recientes] = await Promise.all([
    prisma.reporte.count(),
    prisma.reporte.groupBy({ by: ["estadoId"], _count: true }),
    prisma.reporte.groupBy({ by: ["categoriaId"], _count: true }),
    prisma.reporte.findMany({
      take: 8,
      orderBy: { creadoEn: "desc" },
      include: {
        categoria: { select: { nombre: true } },
        zona: { select: { nombre: true } },
        estado: { select: { nombre: true } },
        usuario: { select: { nombre: true } },
      },
    }),
  ]);

  const estados = await prisma.estadoReporte.findMany();
  const categorias = await prisma.categoria.findMany();

  const estadoMap = new Map(estados.map((e) => [e.id, e.nombre]));
  const categoriaMap = new Map(categorias.map((c) => [c.id, c.nombre]));

  const conteoEstado: Record<string, number> = {};
  for (const e of estados) conteoEstado[e.nombre] = 0;
  for (const g of porEstado)
    conteoEstado[estadoMap.get(g.estadoId) ?? "?"] = g._count;

  const conteoCategoria = porCategoria
    .map((g) => ({
      nombre: categoriaMap.get(g.categoriaId) ?? "?",
      count: g._count,
    }))
    .sort((a, b) => b.count - a.count);

  return { total, conteoEstado, conteoCategoria, recientes };
}

export default async function DashboardPage() {
  let data;
  try {
    data = await getData();
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  const { total, conteoEstado, conteoCategoria, recientes } = data;
  const maxCat = Math.max(1, ...conteoCategoria.map((c) => c.count));

  const tarjetas = [
    {
      label: "Total de reportes",
      value: total,
      icon: AlertTriangle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pendientes",
      value: conteoEstado["Pendiente"] ?? 0,
      icon: Clock,
      color: "text-[#F59E0B]",
      bg: "bg-amber-500/10",
    },
    {
      label: "En proceso",
      value: conteoEstado["En proceso"] ?? 0,
      icon: Loader2,
      color: "text-[#3B82F6]",
      bg: "bg-blue-500/10",
    },
    {
      label: "Resueltos",
      value: conteoEstado["Resuelto"] ?? 0,
      icon: CheckCircle2,
      color: "text-[#10B981]",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen general de los reportes ciudadanos.
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{t.label}</p>
                  <p className="mt-1 text-3xl font-bold">{t.value}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${t.bg}`}
                >
                  <Icon className={`h-6 w-6 ${t.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reportes por categoria */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tags className="h-4 w-4 text-muted-foreground" />
              Reportes por categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conteoCategoria.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos.</p>
            ) : (
              conteoCategoria.map((c) => (
                <div key={c.nombre} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.nombre}</span>
                    <span className="text-muted-foreground">{c.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.count / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Reportes recientes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Reportes recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reportes">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="pr-6">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recientes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Aún no hay reportes.
                    </TableCell>
                  </TableRow>
                ) : (
                  recientes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="pl-6">
                        <Link
                          href={`/reportes/${r.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {r.titulo}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {r.usuario?.nombre} · {r.zona?.nombre ?? "Sin zona"}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.categoria?.nombre}
                      </TableCell>
                      <TableCell>
                        <EstadoBadge nombre={r.estado?.nombre ?? "—"} />
                      </TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground">
                        {formatFecha(r.creadoEn)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
