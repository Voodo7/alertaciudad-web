// Mapeo de estado -> color (mismos colores que la app movil).
export const ESTADO_COLORS: Record<string, { bg: string; text: string; dot: string; hex: string }> = {
  Pendiente: {
    bg: "bg-amber-100 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-[#F59E0B]",
    hex: "#F59E0B",
  },
  "En proceso": {
    bg: "bg-blue-100 dark:bg-blue-500/15",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-[#3B82F6]",
    hex: "#3B82F6",
  },
  Resuelto: {
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-[#10B981]",
    hex: "#10B981",
  },
};

export function estadoColor(nombre: string) {
  return (
    ESTADO_COLORS[nombre] ?? {
      bg: "bg-slate-100 dark:bg-slate-500/15",
      text: "text-slate-700 dark:text-slate-300",
      dot: "bg-slate-400",
      hex: "#94A3B8",
    }
  );
}
