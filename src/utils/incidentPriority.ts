/**
 * Configuración de prioridades de incidentes.
 * Mapea los valores devueltos por el backend a su representación visual.
 *
 * Prioridades del backend: "Alta", "Media", "Baja"
 */

export type IncidentPriority = "Alta" | "Media" | "Baja";

export interface PriorityConfig {
  label: string;
  className: string;
  icon: string;
  color: string;
}

export const INCIDENT_PRIORITY_CONFIG: Record<IncidentPriority, PriorityConfig> = {
  Alta: {
    label: "Alta",
    className:
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700",
    icon: "🔴",
    color: "#DC2626",
  },
  Media: {
    label: "Media",
    className:
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700",
    icon: "🟠",
    color: "#EA580C",
  },
  Baja: {
    label: "Baja",
    className:
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700",
    icon: "🟢",
    color: "#16A34A",
  },
};

const UNKNOWN_PRIORITY_CONFIG: PriorityConfig = {
  label: "Sin prioridad",
  className:
    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700",
  icon: "⚪",
  color: "#6B7280",
};

export function getPriorityConfig(priority: string | null | undefined): PriorityConfig {
  if (!priority) return UNKNOWN_PRIORITY_CONFIG;
  return (
    INCIDENT_PRIORITY_CONFIG[priority as IncidentPriority] ?? UNKNOWN_PRIORITY_CONFIG
  );
}
