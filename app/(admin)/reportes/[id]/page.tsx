import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Tag,
  User,
  Calendar,
  ImageIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/admin/estado-badge";
import { DbError } from "@/components/admin/db-error";
import { EstadoChanger } from "../estado-changer";
import { formatFecha } from "@/lib/utils";
import { estadoColor } from "@/lib/estados";

export const dynamic = "force-dynamic";

export default async function ReporteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reporteId = Number(id);
  if (Number.isNaN(reporteId)) notFound();

  let reporte;
  let estados;
  try {
    [reporte, estados] = await Promise.all([
      prisma.reporte.findUnique({
        where: { id: reporteId },
        include: {
          categoria: true,
          zona: true,
          estado: true,
          usuario: true,
          historial: {
            orderBy: { creadoEn: "desc" },
            include: { estado: true },
          },
        },
      }),
      prisma.estadoReporte.findMany({ orderBy: { id: "asc" } }),
    ]);
  } catch (e) {
    return <DbError detail={e instanceof Error ? e.message : undefined} />;
  }

  if (!reporte) notFound();

  const info = [
    { icon: Tag, label: "Categoría", value: reporte.categoria?.nombre ?? "—" },
    { icon: MapPin, label: "Zona", value: reporte.zona?.nombre ?? "Sin zona" },
    { icon: User, label: "Usuario", value: reporte.usuario?.nombre ?? "—" },
    { icon: Calendar, label: "Creado", value: formatFecha(reporte.creadoEn) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/reportes" aria-label="Volver">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {reporte.titulo}
              </h1>
              <EstadoBadge nombre={reporte.estado?.nombre ?? "—"} />
            </div>
            <p className="text-sm text-muted-foreground">Reporte #{reporte.id}</p>
          </div>
        </div>
        <EstadoChanger
          reporteId={reporte.id}
          estadoActualId={reporte.estadoId}
          estadoOptions={estados.map((e) => ({ value: e.id, label: e.nombre }))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {reporte.descripcion}
              </p>
            </CardContent>
          </Card>

          {reporte.fotoUrl ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" /> Foto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={reporte.fotoUrl}
                  alt={reporte.titulo}
                  className="max-h-96 w-full rounded-lg border object-cover"
                />
              </CardContent>
            </Card>
          ) : null}

          {/* Línea de tiempo del historial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de estados</CardTitle>
            </CardHeader>
            <CardContent>
              {reporte.historial.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin movimientos.</p>
              ) : (
                <ol className="relative space-y-6 border-l pl-6">
                  {reporte.historial.map((h) => {
                    const c = estadoColor(h.estado?.nombre ?? "");
                    return (
                      <li key={h.id} className="relative">
                        <span
                          className="absolute -left-[1.95rem] mt-0.5 h-3 w-3 rounded-full ring-4 ring-background"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <EstadoBadge nombre={h.estado?.nombre ?? "—"} />
                          <span className="text-xs text-muted-foreground">
                            {formatFecha(h.creadoEn)}
                          </span>
                        </div>
                        {h.comentario && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {h.comentario}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {info.map((i) => {
                const Icon = i.icon;
                return (
                  <div key={i.label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{i.label}</p>
                      <p className="text-sm font-medium">{i.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {reporte.lat != null && reporte.lng != null ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  <span className="text-muted-foreground">Lat:</span> {reporte.lat}
                  <br />
                  <span className="text-muted-foreground">Lng:</span> {reporte.lng}
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a
                    href={`https://www.google.com/maps?q=${reporte.lat},${reporte.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en Google Maps
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
