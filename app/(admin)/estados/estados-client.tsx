"use client";

import { CrudResource, type Column, type Field } from "@/components/admin/crud-resource";
import { Badge } from "@/components/ui/badge";
import { EstadoBadge } from "@/components/admin/estado-badge";
import { crearEstado, actualizarEstado, eliminarEstado } from "./actions";

export type EstadoRow = { id: number; nombre: string; reportes: number };

const fields: Field[] = [
  { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Ej: Pendiente" },
];

const columns: Column<EstadoRow>[] = [
  { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
  { key: "nombre", header: "Estado", render: (r) => <EstadoBadge nombre={r.nombre} /> },
  { key: "reportes", header: "Reportes", render: (r) => <Badge variant="muted">{r.reportes}</Badge> },
];

export function EstadosClient({ rows }: { rows: EstadoRow[] }) {
  return (
    <CrudResource<EstadoRow>
      title="Estados"
      description="Estados posibles del ciclo de vida de un reporte."
      singular="Estado"
      rows={rows}
      columns={columns}
      fields={fields}
      searchKeys={["nombre"]}
      createAction={crearEstado}
      updateAction={actualizarEstado}
      deleteAction={eliminarEstado}
    />
  );
}
