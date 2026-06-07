"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/toast";
import { type FieldOption } from "@/components/admin/crud-resource";
import { cambiarEstadoReporte } from "./actions";

export function EstadoChanger({
  reporteId,
  estadoActualId,
  estadoOptions,
}: {
  reporteId: number;
  estadoActualId: number;
  estadoOptions: FieldOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [estadoId, setEstadoId] = React.useState(String(estadoActualId));
  const [comentario, setComentario] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await cambiarEstadoReporte(
        reporteId,
        Number(estadoId),
        comentario
      );
      if (res.ok) {
        toast({ variant: "success", title: "Estado actualizado" });
        setOpen(false);
        setComentario("");
        router.refresh();
      } else {
        toast({ variant: "error", title: "Error", description: res.error });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Cambiar estado"
        onClick={() => {
          setEstadoId(String(estadoActualId));
          setOpen(true);
        }}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogDescription>
              Actualiza el estado del reporte. Se registrará automáticamente en el
              historial.
            </DialogDescription>
          </DialogHeader>
          <div className="my-2 space-y-4">
            <div className="space-y-1.5">
              <Label>Nuevo estado</Label>
              <Select value={estadoId} onValueChange={setEstadoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comentario">Comentario</Label>
              <Textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Motivo o detalle del cambio (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Guardando..." : "Actualizar estado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
