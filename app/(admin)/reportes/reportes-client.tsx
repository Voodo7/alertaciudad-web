"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import {
  CrudResource,
  type Column,
  type Field,
  type FieldOption,
} from "@/components/admin/crud-resource";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/admin/estado-badge";
import { EstadoChanger } from "./estado-changer";
import { crearReporte, actualizarReporte, eliminarReporte } from "./actions";

export type ReporteRow = {
  id: number;
  titulo: string;
  descripcion: string;
  fotoUrl: string | null;
  lat: number | null;
  lng: number | null;
  categoriaId: number;
  zonaId: number | null;
  estadoId: number;
  usuarioId: number;
  categoriaNombre: string;
  zonaNombre: string;
  estadoNombre: string;
  usuarioNombre: string;
  creadoEn: string;
};

export function ReportesClient({
  rows,
  categoriaOptions,
  zonaOptions,
  estadoOptions,
  usuarioOptions,
}: {
  rows: ReporteRow[];
  categoriaOptions: FieldOption[];
  zonaOptions: FieldOption[];
  estadoOptions: FieldOption[];
  usuarioOptions: FieldOption[];
}) {
  const fields: Field[] = [
    { name: "titulo", label: "Título", type: "text", required: true },
    { name: "descripcion", label: "Descripción", type: "textarea", required: true },
    { name: "categoriaId", label: "Categoría", type: "select", required: true, options: categoriaOptions },
    { name: "zonaId", label: "Zona", type: "select", options: zonaOptions, placeholder: "Sin zona" },
    { name: "estadoId", label: "Estado", type: "select", required: true, options: estadoOptions },
    { name: "usuarioId", label: "Usuario", type: "select", required: true, options: usuarioOptions },
    { name: "fotoUrl", label: "URL de foto", type: "text", placeholder: "https://..." },
    { name: "lat", label: "Latitud", type: "number", placeholder: "-12.097" },
    { name: "lng", label: "Longitud", type: "number", placeholder: "-77.036" },
  ];

  const columns: Column<ReporteRow>[] = [
    { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
    {
      key: "titulo",
      header: "Título",
      render: (r) => (
        <div>
          <Link
            href={`/reportes/${r.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {r.titulo}
          </Link>
          <p className="max-w-xs truncate text-xs text-muted-foreground">
            {r.descripcion}
          </p>
        </div>
      ),
    },
    { key: "categoriaNombre", header: "Categoría", render: (r) => <span className="text-sm">{r.categoriaNombre}</span> },
    { key: "zonaNombre", header: "Zona", render: (r) => <span className="text-sm text-muted-foreground">{r.zonaNombre}</span> },
    { key: "estadoNombre", header: "Estado", render: (r) => <EstadoBadge nombre={r.estadoNombre} /> },
    { key: "usuarioNombre", header: "Usuario", render: (r) => <span className="text-sm text-muted-foreground">{r.usuarioNombre}</span> },
    { key: "creadoEn", header: "Fecha", render: (r) => <span className="text-xs text-muted-foreground">{r.creadoEn}</span> },
  ];

  return (
    <CrudResource<ReporteRow>
      title="Reportes"
      description="Incidencias urbanas reportadas por los ciudadanos."
      singular="Reporte"
      rows={rows}
      columns={columns}
      fields={fields}
      searchKeys={["titulo", "descripcion", "categoriaNombre", "zonaNombre", "usuarioNombre"]}
      createAction={crearReporte}
      updateAction={actualizarReporte}
      deleteAction={eliminarReporte}
      rowActions={(r) => (
        <>
          <Button variant="ghost" size="icon" asChild aria-label="Ver detalle">
            <Link href={`/reportes/${r.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <EstadoChanger
            reporteId={r.id}
            estadoActualId={r.estadoId}
            estadoOptions={estadoOptions}
          />
        </>
      )}
    />
  );
}
