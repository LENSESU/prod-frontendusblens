"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { IncidentPriorityBadge } from "@/components/IncidentPriorityBadge";
import { IncidentStatusBadge } from "@/components/IncidentStatusBadge";
import TechnicianIncidentCard from "../components/TechnicianIncidentCard";
import { useTechnicianAssignments } from "../hooks/useTechnicianAssignments";

export default function TechnicianDashboardHome() {
  const router = useRouter();
  const { incidents, categoriesMap, loading, error } = useTechnicianAssignments();

  const statusCounts = useMemo(() => {
    const counts = {
      total: incidents.length,
      nuevo: 0,
      enProceso: 0,
      resuelto: 0,
    };

    incidents.forEach((incident) => {
      if (incident.status === "Nuevo") counts.nuevo += 1;
      else if (incident.status === "En_proceso") counts.enProceso += 1;
      else if (incident.status === "Resuelto") counts.resuelto += 1;
    });

    return counts;
  }, [incidents]);

  const recentIncidents = incidents.slice(0, 5);

  if (loading) {
    return (
      <div style={{ padding: "var(--space-xl)", display: "flex", alignItems: "center", gap: "var(--space-sm)", justifyContent: "center" }}>
        <span className="spinner spinner-dark" />
        <p className="text-secondary">Cargando panel tecnico…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: "var(--space-xl)" }}>
        <div className="alert-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: "var(--space-xl)" }}>
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)" }}>
          Panel del Tecnico
        </h1>
        <p className="text-secondary" style={{ marginTop: 6 }}>
          Resumen de tus asignaciones activas.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-md)",
          marginBottom: "var(--space-lg)",
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <p className="text-xs text-secondary">Total asignados</p>
          <p style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            {statusCounts.total}
          </p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p className="text-xs text-secondary">En progreso</p>
          <p style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            {statusCounts.enProceso}
          </p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p className="text-xs text-secondary">Nuevos</p>
          <p style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            {statusCounts.nuevo}
          </p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p className="text-xs text-secondary">Resueltos</p>
          <p style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            {statusCounts.resuelto}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
              Incidentes recientes
            </p>
            <p className="text-xs text-secondary">
              {recentIncidents.length === 0
                ? "No tienes incidentes asignados todavia."
                : "Ultimos incidentes asignados por el administrador."}
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/dashboard/tecnico/incidentes")}
          >
            Ver todos
          </button>
        </div>

        {recentIncidents.length === 0 ? (
          <div className="card-body-center">
            <p className="card-desc" style={{ marginBottom: 0 }}>
              Cuando tengas asignaciones apareceran aqui.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: "var(--space-md)",
            }}
          >
            {recentIncidents.map((incident) => (
              <TechnicianIncidentCard
                key={incident.id}
                incident={incident}
                categoryName={categoriesMap[incident.category_id] ?? "Sin categoria"}
                onOpen={() =>
                  router.push(`/dashboard/tecnico/incidente-detalle?id=${incident.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      {recentIncidents.length > 0 ? (
        <div style={{ marginTop: "var(--space-md)", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <IncidentStatusBadge status="Nuevo" showIcon />
          <IncidentStatusBadge status="En_proceso" showIcon />
          <IncidentStatusBadge status="Resuelto" showIcon />
          <IncidentPriorityBadge priority="Alta" />
          <IncidentPriorityBadge priority="Media" />
          <IncidentPriorityBadge priority="Baja" />
        </div>
      ) : null}
    </div>
  );
}
