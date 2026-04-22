"use client";

import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { restoreAuthSession, type AuthData } from "@/utils/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type IncidentDetail = {
  id: string;
  status: string;
  priority: string | null;
  created_at: string;
  updated_at: string | null;
  category_id: string;
  campus_place: string | null;
  description: string;
  latitude: number | null;
  longitude: number | null;
  student_id: string;
  technician_id: string | null;
  before_photo_id: string | null;
  after_photo_id: string | null;
};

type Category = {
  id: string;
  name: string;
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatStatusLabel(status: string): string {
  if (status === "En_proceso") return "EN PROGRESO";
  if (status === "Nuevo") return "NUEVO";
  if (status === "Resuelto") return "RESUELTO";
  return status.toUpperCase();
}

function getStatusDotColor(status: string): string {
  if (status === "Nuevo") return "#EF630F";
  if (status === "En_proceso") return "#2397f5";
  if (status === "Resuelto") return "#4CAF50";
  return "#9E9E9E";
}

function getPriorityDotColor(priority: string): string {
  if (priority === "Alta") return "#F44336";
  if (priority === "Media") return "#EF630F";
  return "#9E9E9E";
}

function TecnicoIncidenteDetalleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const incidentId = searchParams.get("id");

  const [auth, setAuth] = useState<AuthData | null>(null);
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Carga de sesión ──
  useEffect(() => {
    async function loadSession() {
      const session = await restoreAuthSession();
      setAuth(session);
    }
    void loadSession();
  }, []);

  // ── Carga de incidente y categoría ──
  useEffect(() => {
    if (!auth?.accessToken || !incidentId) {
      if (!incidentId) setError("No se especificó un incidente.");
      return;
    }

    const token = auth.accessToken;

    async function fetchData() {
      try {
        const [incRes, catRes] = await Promise.all([
          fetch(`${API}/api/v1/incidents/${incidentId}/`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API}/api/v1/categories/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!incRes.ok) throw new Error("No se pudo cargar el incidente.");

        const incData = (await incRes.json()) as IncidentDetail;
        setIncident(incData);

        if (catRes.ok) {
          const catData = (await catRes.json()) as { items?: Category[] } | Category[];
          const cats: Category[] = Array.isArray(catData) ? catData : (catData.items ?? []);
          const found = cats.find((c) => c.id === incData.category_id);
          setCategoryName(found?.name ?? "Sin categoría");
        }
      } catch {
        setError("No se pudo cargar la información del incidente.");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [auth, incidentId, refreshKey]);

  if (loading) {
    return (
      <div className="page-centered">
        <p className="text-secondary">Cargando incidente...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="page-centered">
        <div className="form-wrapper">
          <div className="alert-error">
            <p>{error ?? "Incidente no encontrado."}</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const mapsUrl =
    incident.latitude != null && incident.longitude != null
      ? `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`
      : null;

  async function handleStatusUpdate(newStatus: string) {
    if (!auth?.accessToken || !incident) return;
    setUpdatingStatus(true);
    setStatusError(null);
    setStatusFeedback(null);
    try {
      // Si el técnico salta de Nuevo a Resuelto, primero pasamos por En_proceso
      if (incident.status === "Nuevo" && newStatus === "Resuelto") {
        await fetch(`${API}/api/v1/incidents/${incident.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.accessToken}` },
          body: JSON.stringify({ status: "En_proceso" }),
        });
      }
      const res = await fetch(`${API}/api/v1/incidents/${incident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.accessToken}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg =
          (typeof body?.detail === "string" && body.detail) ||
          body?.detail?.message ||
          "No se pudo actualizar el estado.";
        throw new Error(msg);
      }
      const label = newStatus === "En_proceso" ? "En progreso" : "Resuelto";
      setStatusFeedback(`Estado actualizado a "${label}" correctamente.`);
      setTimeout(() => setStatusFeedback(null), 5000);
      // Re-fetch completo para reflejar datos frescos del backend
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Error inesperado al actualizar.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 40px" }}>

      {/* ══ BARRA SUPERIOR ══ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 0 8px",
          borderBottom: "1px solid var(--color-border-light)",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
            Panel
          </button>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-hint)" }}>›</span>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            Detalle del Incidente
          </span>
        </div>

        {/* Botón volver */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: "7px 18px",
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
            cursor: "pointer",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>
      </div>

      {/* ══ HEADER: título + badges ══ */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
            Incidente{" "}
            <span style={{ color: "var(--color-primary)" }}>
              #{incident.id.slice(0, 8).toUpperCase()}
            </span>
          </h1>
          <p style={{ fontSize: "var(--font-size-small)", color: "var(--color-text-secondary)", marginTop: 4 }}>
            Reportado el {formatDate(incident.created_at)}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Badge prioridad */}
          {incident.priority && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: `1px solid ${getPriorityDotColor(incident.priority)}`,
                borderRadius: "var(--radius-full)",
                padding: "5px 14px",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                color: getPriorityDotColor(incident.priority),
                background: "#fff",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: getPriorityDotColor(incident.priority),
                  display: "inline-block",
                }}
              />
              NIVEL DE PRIORIDAD: {incident.priority.toUpperCase()}
            </span>
          )}

          {/* Badge estado */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: `1px solid ${getStatusDotColor(incident.status)}`,
              borderRadius: "var(--radius-full)",
              padding: "5px 14px",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              color: getStatusDotColor(incident.status),
              background: "#fff",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: getStatusDotColor(incident.status),
                display: "inline-block",
              }}
            />
            {formatStatusLabel(incident.status)}
          </span>
        </div>
      </div>

      {/* ══ GRID PRINCIPAL: 3 columnas ══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}
      >

        {/* ════ COLUMNA 1: Información del reporte ════ */}
        <div className="card" style={{ overflow: "visible" }}>
          {/* Header sección */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid var(--color-border-light)",
              padding: "12px 16px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-text-secondary)",
              }}
            >
              Información del Reporte
            </span>
          </div>

          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Sub-card reporte estudiante */}
            <div
              style={{
                border: "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-sm)",
                padding: 12,
              }}
            >
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-secondary)",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Reporte de Estudiante
              </p>

              {/* Categoría */}
              <div style={{ marginBottom: 10 }}>
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-hint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  Categoría
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 12V7a4 4 0 0 1 4-4z" />
                  </svg>
                  <span
                    style={{
                      fontSize: "var(--font-size-small)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {categoryName}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: 10 }}>
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-hint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  Descripción
                </p>
                <div
                  style={{
                    background: "var(--color-bg-muted)",
                    border: "1px solid var(--color-border-light)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 10px",
                    fontSize: "var(--font-size-small)",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {incident.description || "Sin descripción"}
                </div>
              </div>

              {/* Mapa / coordenadas */}
              {incident.latitude != null && incident.longitude != null ? (
                <div>
                  <a
                    href={mapsUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: "1px solid var(--color-border-light)",
                      marginBottom: 6,
                      textDecoration: "none",
                    }}
                  >
                    {/* Placeholder de mapa — reemplazar con componente real si se integra Google Maps */}
                    <div
                      style={{
                        height: 120,
                        background: "#e8ecef",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        color: "var(--color-text-hint)",
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span style={{ fontSize: 11 }}>Google Maps</span>
                    </div>
                  </a>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                      Ubicación Detallada
                    </span>
                  </div>
                  <p style={{ fontSize: "var(--font-size-small)", color: "var(--color-text-primary)", marginTop: 2, paddingLeft: 19 }}>
                    {incident.campus_place ?? `${incident.latitude}, ${incident.longitude}`}
                  </p>
                </div>
              ) : incident.campus_place ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Ubicación Detallada
                    </span>
                  </div>
                  <p style={{ fontSize: "var(--font-size-small)", color: "var(--color-text-primary)", marginTop: 4, paddingLeft: 19 }}>
                    {incident.campus_place}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Última actualización */}
            {incident.updated_at && (
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-hint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  Última Actualización
                </p>
                <p style={{ fontSize: "var(--font-size-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(incident.updated_at)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ════ COLUMNA 2: Evidencia visual ════ */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid var(--color-border-light)",
              padding: "12px 16px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-text-secondary)",
              }}
            >
              Evidencia Visual
            </span>
          </div>

          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Foto antes */}
            <div>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-hint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Antes (Reporte)</span>
                {incident.before_photo_id && (
                  <span style={{ fontSize: 10, color: "var(--color-primary)", fontWeight: 600 }}>JPG</span>
                )}
              </p>
              {incident.before_photo_id ? (
                <div
                  style={{
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    border: "1px solid var(--color-border-light)",
                  }}
                >
                  <Image
                    src={`${API}/api/v1/photos/${incident.before_photo_id}`}
                    alt="Foto antes del incidente"
                    width={400}
                    height={180}
                    style={{ width: "100%", height: "auto", objectFit: "cover", maxHeight: 180, display: "block" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 140,
                    border: "1px dashed var(--color-border-light)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-bg-muted)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-hint)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-hint)" }}>
                    Sin foto de reporte
                  </span>
                </div>
              )}
            </div>

            {/* Foto resolución — placeholder para tarea #241 */}
            <div>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-hint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Resolución (Pendiente)
              </p>
              {/* TODO #241 — Tarea 1 (Front): Implementar componente de carga de imagen de evidencia */}
              <div
                style={{
                  height: 140,
                  border: "1px dashed var(--color-border-light)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-bg-muted)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "not-allowed",
                  opacity: 0.6,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-hint)" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-hint)" }}>
                  Subir foto de resolución
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ════ COLUMNA 3: Gestión técnica ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: "1px solid var(--color-border-light)",
                padding: "12px 16px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-semibold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-secondary)",
                }}
              >
                Gestión Técnica
              </span>
            </div>

            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Estado del incidente */}
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-hint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 10,
                  }}
                >
                  Estado del incidente
                </p>

                {/* Alertas de feedback */}
                {statusError && (
                  <div className="alert-error" style={{ marginBottom: 10 }}>
                    <p>{statusError}</p>
                  </div>
                )}
                {statusFeedback && (
                  <div className="alert-success" style={{ marginBottom: 10 }}>
                    <p>{statusFeedback}</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {/* Botón "En progreso" — activo solo cuando el incidente está en Nuevo */}
                  <button
                    type="button"
                    disabled={incident.status !== "Nuevo" || updatingStatus}
                    onClick={() => handleStatusUpdate("En_proceso")}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: incident.status === "Nuevo" ? "#e6f3ff" : "var(--color-bg-muted)",
                      color: incident.status === "Nuevo" ? "#2397f5" : "var(--color-text-disabled)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      cursor: incident.status === "Nuevo" && !updatingStatus ? "pointer" : "not-allowed",
                      opacity: incident.status === "Nuevo" ? 1 : 0.5,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {updatingStatus && incident.status === "Nuevo" ? "Guardando..." : "En progreso"}
                  </button>

                  {/* Botón "Resuelto" — activo solo cuando está En_proceso */}
                  <button
                    type="button"
                    disabled={incident.status !== "En_proceso" || updatingStatus}
                    onClick={() => handleStatusUpdate("Resuelto")}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: incident.status === "En_proceso" ? "var(--color-success-bg)" : "var(--color-bg-muted)",
                      color: incident.status === "En_proceso" ? "var(--color-success)" : "var(--color-text-disabled)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      cursor: incident.status === "En_proceso" && !updatingStatus ? "pointer" : "not-allowed",
                      opacity: incident.status === "En_proceso" ? 1 : 0.5,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {updatingStatus && incident.status === "En_proceso" ? "Guardando..." : "Resuelto"}
                  </button>
                </div>

                {/* Estado actual del incidente */}
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${getStatusDotColor(incident.status)}`,
                    background: "var(--color-bg-card)",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: getStatusDotColor(incident.status),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: getStatusDotColor(incident.status), display: "inline-block", flexShrink: 0 }} />
                  Estado actual: {formatStatusLabel(incident.status)}
                </div>
              </div>

              {/* Evidencia incidente terminado — placeholder #241 */}
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-hint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Evidencia Incidente Terminado
                </p>
                {/* TODO #241 — Tarea 1 (Front): Implementar componente de carga de imagen de evidencia */}
                <div
                  style={{
                    height: 100,
                    border: "2px dashed var(--color-border-light)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-bg-muted)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    cursor: "not-allowed",
                    opacity: 0.6,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-hint)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span style={{ fontSize: 11, color: "var(--color-text-hint)" }}>
                    Subir foto &quot;Evidencia&quot;
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Incidente Completado — disponible cuando está En_proceso */}
          <button
            type="button"
            disabled={incident.status === "Resuelto" || updatingStatus}
            onClick={() => {
              if (incident.status === "Nuevo") handleStatusUpdate("Resuelto");
              else if (incident.status === "En_proceso") handleStatusUpdate("Resuelto");
            }}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: incident.status === "Resuelto" ? "var(--color-success)" : "var(--color-primary)",
              color: "#fff",
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-bold)",
              cursor: incident.status === "Resuelto" || updatingStatus ? "not-allowed" : "pointer",
              opacity: incident.status === "Resuelto" ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              transition: "opacity 0.15s, background 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {updatingStatus ? "Guardando..." : incident.status === "Resuelto" ? "Incidente Completado ✓" : "Marcar como Completado"}
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <p className="page-footer" style={{ margin: 0, maxWidth: "none" }}>
          © {new Date().getFullYear()} Universidad San Buenaventura Cali · USB LENS
        </p>
      </div>
    </div>
  );
}

export default function TecnicoIncidenteDetallePage() {
  return (
    <Suspense fallback={<div className="page-centered"><p className="text-secondary">Cargando...</p></div>}>
      <TecnicoIncidenteDetalleContent />
    </Suspense>
  );
}