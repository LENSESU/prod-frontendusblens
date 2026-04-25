"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentPriorityBadge } from "@/components/IncidentPriorityBadge";
import { IncidentStatusBadge } from "@/components/IncidentStatusBadge";
import { restoreAuthSession } from "@/utils/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type TechnicianAssignment = {
  id: string;
  categoria: string;
  location: string | null;
  status: "Nuevo" | "En_proceso" | "Resuelto";
  created_at: string;
  assigned_by_admin: string;
};

export default function TechnicianDashboardHome() {
  const router = useRouter();

  const [incidents, setIncidents] = useState<TechnicianAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setLoading(true);
        setError(null);

        const session = await restoreAuthSession();

        if (!session?.accessToken) {
          setError("No se encontró sesión activa.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API}/api/v1/dashboard/technician/assignments`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("No se pudieron cargar las asignaciones.");
        }

        const data = await res.json();

        const assignments = Array.isArray(data)
          ? data
          : data.items || [];

        setIncidents(assignments);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error cargando asignaciones."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, []);

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
      <div
        style={{
          padding: "var(--space-xl)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          justifyContent: "center",
        }}
      >
        <span className="spinner spinner-dark" />
        <p className="text-secondary">Cargando panel tecnico…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{ paddingTop: "var(--space-xl)" }}
      >
        <div className="alert-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ paddingBottom: "var(--space-xl)" }}
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          Panel del Tecnico
        </h1>

        <p
          className="text-secondary"
          style={{ marginTop: 6 }}
        >
          Resumen de tus asignaciones activas.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-md)",
          marginBottom: "var(--space-lg)",
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <p className="text-xs text-secondary">
            Total asignados
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {statusCounts.total}
          </p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <p className="text-xs text-secondary">
            En progreso
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {statusCounts.enProceso}
          </p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <p className="text-xs text-secondary">
            Nuevos
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {statusCounts.nuevo}
          </p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <p className="text-xs text-secondary">
            Resueltos
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
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
            <p
              style={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
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
            onClick={() =>
              router.push(
                "/dashboard/tecnico/incidentes"
              )
            }

             style={{
              width: "auto",
              minWidth: "unset",
              padding: "8px 14px",
              flexShrink: 0,
            }}
          >
            Ver todos
          </button>
        </div>

        {recentIncidents.length === 0 ? (
          <div className="card-body-center">
            <p
              className="card-desc"
              style={{ marginBottom: 0 }}
            >
              Cuando tengas asignaciones apareceran aqui.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 850,
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "var(--color-bg-muted)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: 10 }}>ID</th>
                  <th style={{ padding: 10 }}>
                    Categoria
                  </th>
                  <th style={{ padding: 10 }}>
                    Lugar
                  </th>
                  <th style={{ padding: 10 }}>
                    Estado
                  </th>
                  <th style={{ padding: 10 }}>
                    Fecha
                  </th>
                  <th style={{ padding: 10 }}>
                    Admin
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/tecnico/incidente-detalle?id=${incident.id}`
                      )
                    }
                    style={{
                      borderBottom:
                        "1px solid var(--color-border-light)",
                      cursor: "pointer",
                    }}
                  >
                    <td
                      style={{
                        padding: 10,
                        fontWeight: 700,
                        color:
                          "var(--color-primary)",
                      }}
                    >
                      #
                      {incident.id
                        .slice(0, 8)
                        .toUpperCase()}
                    </td>

                    <td style={{ padding: 10 }}>
                      {incident.categoria}
                    </td>

                    <td style={{ padding: 10 }}>
                      {incident.location ||
                        "Sin ubicación"}
                    </td>

                    <td style={{ padding: 10 }}>
                      <IncidentStatusBadge
                        status={incident.status}
                      />
                    </td>

                    <td style={{ padding: 10 }}>
                      {new Date(
                        incident.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td style={{ padding: 10 }}>
                      {
                        incident.assigned_by_admin
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {recentIncidents.length > 0 ? (
        <div
          style={{
            marginTop: "var(--space-md)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <IncidentStatusBadge
            status="Nuevo"
            showIcon
          />
          <IncidentStatusBadge
            status="En_proceso"
            showIcon
          />
          <IncidentStatusBadge
            status="Resuelto"
            showIcon
          />
          <IncidentPriorityBadge priority="Alta" />
          <IncidentPriorityBadge priority="Media" />
          <IncidentPriorityBadge priority="Baja" />
        </div>
      ) : null}
    </div>
  );
}