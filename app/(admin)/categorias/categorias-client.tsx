"use client";

import { CrudResource, type Column, type Field } from "@/components/admin/crud-resource";
import { Badge } from "@/components/ui/badge";
import {
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "./actions";

export type CategoriaRow = {
  id: number;
  nombre: string;
  icono: string | null;
  reportes: number;
};

const fields: Field[] = [
  { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Ej: Alumbrado" },
  {
    name: "icono",
    label: "Icono",
    type: "text",
    placeholder: "Ej: bulb",
    helpText: "Nombre del icono usado por la app móvil (opcional).",
  },
];

const columns: Column<CategoriaRow>[] = [
  { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
  { key: "nombre", header: "Nombre", render: (r) => <span className="font-medium">{r.nombre}</span> },
  {
    key: "icono",
    header: "Icono",
    render: (r) =>
      r.icono ? <code className="text-xs">{r.icono}</code> : <span className="text-muted-foreground">—</span>,
  },
  { key: "reportes", header: "Reportes", render: (r) => <Badge variant="muted">{r.reportes}</Badge> },
];

export function CategoriasClient({ rows }: { rows: CategoriaRow[] }) {
  return (
    <CrudResource<CategoriaRow>
      title="Categorías"
      description="Tipos de incidencia que los ciudadanos pueden reportar."
      singular="Categoría"
      rows={rows}
      columns={columns}
      fields={fields}
      searchKeys={["nombre"]}
      createAction={crearCategoria}
      updateAction={actualizarCategoria}
      deleteAction={eliminarCategoria}
    />
  );
}
