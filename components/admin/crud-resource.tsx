"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select";

export type FieldOption = { value: string | number; label: string };

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  /** No mostrar este campo al editar (ej: password opcional) */
  optionalOnEdit?: boolean;
  helpText?: string;
};

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type ActionResult = { ok: boolean; error?: string };

type Props<T extends Record<string, unknown>> = {
  title: string;
  description?: string;
  singular: string;
  rows: T[];
  columns: Column<T>[];
  fields: Field[];
  idKey?: keyof T;
  searchKeys?: (keyof T)[];
  createAction?: (data: Record<string, string>) => Promise<ActionResult>;
  updateAction?: (
    id: number,
    data: Record<string, string>
  ) => Promise<ActionResult>;
  deleteAction?: (id: number) => Promise<ActionResult>;
  /** Acciones extra por fila (ej: ver detalle, cambiar estado) */
  rowActions?: (row: T) => React.ReactNode;
  /** Deshabilita el boton de crear */
  disableCreate?: boolean;
};

export function CrudResource<T extends Record<string, unknown>>({
  title,
  description,
  singular,
  rows,
  columns,
  fields,
  idKey = "id" as keyof T,
  searchKeys,
  createAction,
  updateAction,
  deleteAction,
  rowActions,
  disableCreate,
}: Props<T>) {
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<T | null>(null);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<T | null>(null);
  const [query, setQuery] = React.useState("");

  const openCreate = () => {
    setEditing(null);
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.name] = "";
    setValues(initial);
    setOpen(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    const initial: Record<string, string> = {};
    for (const f of fields) {
      const v = row[f.name as keyof T];
      initial[f.name] = v == null ? "" : String(v);
    }
    setValues(initial);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Validacion basica de requeridos
      for (const f of fields) {
        if (f.required && !editing && !values[f.name]?.trim()) {
          toast({
            variant: "error",
            title: "Campo requerido",
            description: `"${f.label}" es obligatorio.`,
          });
          setSaving(false);
          return;
        }
      }

      let res: ActionResult;
      if (editing) {
        const id = Number(editing[idKey]);
        res = (await updateAction?.(id, values)) ?? { ok: false, error: "N/D" };
      } else {
        res = (await createAction?.(values)) ?? { ok: false, error: "N/D" };
      }

      if (res.ok) {
        toast({
          variant: "success",
          title: editing ? `${singular} actualizado` : `${singular} creado`,
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "error",
          title: "No se pudo guardar",
          description: res.error,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const id = Number(deleting[idKey]);
      const res = (await deleteAction?.(id)) ?? { ok: false, error: "N/D" };
      if (res.ok) {
        toast({ variant: "success", title: `${singular} eliminado` });
        setDeleting(null);
        router.refresh();
      } else {
        toast({
          variant: "error",
          title: "No se pudo eliminar",
          description: res.error,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const filtered = React.useMemo(() => {
    if (!query.trim() || !searchKeys?.length) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, searchKeys]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {searchKeys?.length ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 pl-8"
              />
            </div>
          ) : null}
          {createAction && !disableCreate && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.header}
                </TableHead>
              ))}
              {(updateAction || deleteAction || rowActions) && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="py-12 text-center text-muted-foreground"
                >
                  No hay registros.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={String(row[idKey])}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "—")}
                    </TableCell>
                  ))}
                  {(updateAction || deleteAction || rowActions) && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {rowActions?.(row)}
                        {updateAction && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(row)}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {deleteAction && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(row)}
                            aria-label="Eliminar"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal crear / editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? `Editar ${singular}` : `Nuevo ${singular}`}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? `Modifica los datos del ${singular.toLowerCase()}.`
                  : `Completa los datos del nuevo ${singular.toLowerCase()}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-4">
              {fields.map((f) => {
                return (
                  <div key={f.name} className="space-y-1.5">
                    <Label htmlFor={f.name}>
                      {f.label}
                      {f.required && !editing && (
                        <span className="ml-0.5 text-destructive">*</span>
                      )}
                    </Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        id={f.name}
                        value={values[f.name] ?? ""}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [f.name]: e.target.value }))
                        }
                      />
                    ) : f.type === "select" ? (
                      <Select
                        value={values[f.name] ?? ""}
                        onValueChange={(val) =>
                          setValues((v) => ({ ...v, [f.name]: val }))
                        }
                      >
                        <SelectTrigger id={f.name}>
                          <SelectValue placeholder={f.placeholder ?? "Selecciona..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options?.map((o) => (
                            <SelectItem key={o.value} value={String(o.value)}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={f.name}
                        type={f.type}
                        value={values[f.name] ?? ""}
                        placeholder={
                          f.optionalOnEdit && editing
                            ? "Dejar en blanco para no cambiar"
                            : f.placeholder
                        }
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [f.name]: e.target.value }))
                        }
                      />
                    )}
                    {f.helpText && (
                      <p className="text-xs text-muted-foreground">{f.helpText}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar eliminacion */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar {singular.toLowerCase()}</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. ¿Seguro que deseas eliminar este
              registro?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
