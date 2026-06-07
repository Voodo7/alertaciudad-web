"use client";

import { CrudResource, type Column, type Field } from "@/components/admin/crud-resource";
import {
  crearAdministrador,
  actualizarAdministrador,
  eliminarAdministrador,
} from "./actions";

export type AdminRow = {
  id: number;
  nombre: string;
  correo: string;
  creadoEn: string;
};

const fields: Field[] = [
  { name: "nombre", label: "Nombre", type: "text", required: true },
  { name: "correo", label: "Correo", type: "email", required: true, placeholder: "admin@alertaciudad.pe" },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    required: true,
    optionalOnEdit: true,
    helpText: "Mínimo 6 caracteres. Se guarda cifrada (bcrypt).",
  },
];

const columns: Column<AdminRow>[] = [
  { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
  { key: "nombre", header: "Nombre", render: (r) => <span className="font-medium">{r.nombre}</span> },
  { key: "correo", header: "Correo", render: (r) => <span className="text-muted-foreground">{r.correo}</span> },
  { key: "creadoEn", header: "Creado", render: (r) => <span className="text-xs text-muted-foreground">{r.creadoEn}</span> },
];

export function AdministradoresClient({ rows }: { rows: AdminRow[] }) {
  return (
    <CrudResource<AdminRow>
      title="Administradores"
      description="Cuentas con acceso al portal administrativo."
      singular="Administrador"
      rows={rows}
      columns={columns}
      fields={fields}
      searchKeys={["nombre", "correo"]}
      createAction={crearAdministrador}
      updateAction={actualizarAdministrador}
      deleteAction={eliminarAdministrador}
    />
  );
}
