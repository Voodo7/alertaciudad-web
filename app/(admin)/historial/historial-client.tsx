"use client";

import {
  CrudResource,
  type Column,
  type Field,
  type FieldOption,
} from "@/components/admin/crud-resource";
import { EstadoBadge } from "@/components/admin/estado-badge";
import {
  crearHistorial,
  actualizarHistorial,
  eliminarHistorial,
} from "./actions";

export type HistorialRow = {
  id: number;
  reporteId: number;
  reporteTitulo: string;
  estadoId: number;
  estadoNombre: string;
  comentario: string | null;
  creadoEn: string;
};

const columns: Column<HistorialRow>[] = [
  { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
  {
    key: "reporteTitulo",
    header: "Reporte",
    render: (r) => (
      <span className="font-medium">
        #{r.reporteId} · {r.reporteTitulo}
      </span>
    ),
  },
  { key: "estadoNombre", header: "Estado", render: (r) => <EstadoBadge nombre={r.estadoNombre} /> },
  {
    key: "comentario",
    header: "Comentario",
    render: (r) =>
      r.comentario ? <span className="text-sm">{r.comentario}</span> : <span className="text-muted-foreground">—</span>,
  },
  { key: "creadoEn", header: "Fecha", render: (r) => <span className="text-xs text-muted-foreground">{r.creadoEn}</span> },
];

export function HistorialClient({
  rows,
  reporteOptions,
  estadoOptions,
}: {
  rows: HistorialRow[];
  reporteOptions: FieldOption[];
  estadoOptions: FieldOption[];
}) {
  const fields: Field[] = [
    { name: "reporteId", label: "Reporte", type: "select", required: true, options: reporteOptions },
    { name: "estadoId", label: "Estado", type: "select", required: true, options: estadoOptions },
    { name: "comentario", label: "Comentario", type: "textarea", placeholder: "Comentario opcional" },
  ];

  return (
    <CrudResource<HistorialRow>
      title="Historial de reportes"
      description="Registro de cambios de estado de cada reporte."
      singular="Registro"
      rows={rows}
      columns={columns}
      fields={fields}
      searchKeys={["reporteTitulo", "estadoNombre", "comentario"]}
      createAction={crearHistorial}
      updateAction={actualizarHistorial}
      deleteAction={eliminarHistorial}
    />
  );
}
