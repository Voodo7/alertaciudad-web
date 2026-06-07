"use client";

import { CrudResource, type Column, type Field } from "@/components/admin/crud-resource";
import { Badge } from "@/components/ui/badge";
import { crearUsuario, actualizarUsuario, eliminarUsuario } from "./actions";

export type UsuarioRow = {
  id: number;
  nombre: string;
  correo: string;
  firebaseUid: string | null;
  creadoEn: string;
  reportes: number;
};

const fields: Field[] = [
  { name: "nombre", label: "Nombre", type: "text", required: true },
  { name: "correo", label: "Correo", type: "email", required: true, placeholder: "usuario@correo.com" },
  {
    name: "firebaseUid",
    label: "Firebase UID",
    type: "text",
    placeholder: "Opcional",
    helpText: "Identificador de Firebase Auth (opcional, único).",
  },
];

const columns: Column<UsuarioRow>[] = [
  { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
  { key: "nombre", header: "Nombre", render: (r) => <span className="font-medium">{r.nombre}</span> },
  { key: "correo", header: "Correo", render: (r) => <span className="text-muted-foreground">{r.correo}</span> },
  {
    key: "firebaseUid",
    header: "Firebase UID",
    render: (r) =>
      r.firebaseUid ? <code className="text-xs">{r.firebaseUid}</code> : <span className="text-muted-foreground">—</span>,
  },
  { key: "reportes", header: "Reportes", render: (r) => <Badge variant="muted">{r.reportes}</Badge> },
  { key: "creadoEn", header: "Registrado", render: (r) => <span className="text-xs text-muted-foreground">{r.creadoEn}</span> },
];

export function UsuariosClient({ rows }: { rows: UsuarioRow[] }) {
  return (
    <CrudResource<UsuarioRow>
      title="Usuarios"
      description="Ciudadanos registrados que envían reportes desde la app móvil."
      singular="Usuario"
      rows={rows}
      columns={columns}
      fields={fields}
      searchKeys={["nombre", "correo"]}
      createAction={crearUsuario}
      updateAction={actualizarUsuario}
      deleteAction={eliminarUsuario}
    />
  );
}
