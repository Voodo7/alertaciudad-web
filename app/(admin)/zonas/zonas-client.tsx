"use client";

import { CrudResource, type Column, type Field } from "@/components/admin/crud-resource";
import { Badge } from "@/components/ui/badge";
import { crearZona, actualizarZona, eliminarZona } from "./actions";

export type ZonaRow = { id: number; nombre: string; reportes: number };

const fields: Field[] = [
  { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Ej: Miraflores" },
];

const columns: Column<ZonaRow>[] = [
  { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
  { key: "nombre", header: "Nombre", render: (r) => <span className="font-medium">{r.nombre}</span> },
  { key: "reportes", header: "Reportes", render: (r) => <Badge variant="muted">{r.reportes}</Badge> },
];

export function ZonasClient({ rows }: { rows: ZonaRow[] }) {
  return (
    <CrudResource<ZonaRow>
      title="Zonas"
      description="Distritos o zonas geográficas donde se ubican los reportes."
      singular="Zona"
      rows={rows}
      columns={columns}
      fields={fields}
      searchKeys={["nombre"]}
      createAction={crearZona}
      updateAction={actualizarZona}
      deleteAction={eliminarZona}
    />
  );
}
