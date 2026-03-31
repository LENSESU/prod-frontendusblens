"use client";

import Link from "next/link";
import { AuthData, restoreAuthSession } from "@/utils/auth";
import { useEffect, useState } from "react";


const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// función para sacar el userId del token
function getUserIdFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.user_id || payload.id || null;
  } catch {
    return null;
  }
}

// Los props que recibe el componente
type Props = {
  auth: AuthData | null;
  onLogout: () => void;
  isLoggingOut: boolean;
};

/** Filas de ejemplo */
type IncidentMock = {
  id: string;
  category: string;
  place: string;
  date: string;
  status: "en_progreso" | "asignado" | "resuelto" | "cerrado";
};



// Funcion para obtener el nombre del usuario desde su email
function getFirstName(email: string): string {
  return email.split("@")[0];
}

/** De acuerdo al estado de incidentes recientes se define el estado  (.badge, .badge-in-progress, etc.) */
function IncidentStatusBadge({
  status,
}: {
  status: IncidentMock["status"];
}) {
  switch (status) {
    case "en_progreso":
      return <span className="badge">En Progreso</span>;
    case "asignado":
      return <span className="badge badge-in-progress">Asignado</span>;
    case "resuelto":
      return <span className="badge badge-success">Resuelto</span>;
    case "cerrado":
      return <span className="badge badge-closed">Cerrado</span>;
    default:
      return null;
  }
}

/** Icono documento en caja (tarjetas de resumen: esquina superior derecha en el mock) */
function StatDocIcon() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 sm:h-9 sm:w-9 md:h-10 md:w-10"
      aria-hidden
    >
      <svg
        className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    </div>
  );
}

/**
 * Tarjeta de métrica: siempre en grid de 2 columnas (misma fila en móvil y desktop).
 * Fila 1: número (izq) + icono (der); fila 2: título + acento con token primario.
 */
function StatSummaryCard({
  value,
  title,
  subtitle,
}: {
  value: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="card flex h-full min-w-0 flex-col">
      <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between gap-1.5 sm:gap-3">
          <p className="text-xl font-bold tabular-nums leading-none text-[var(--color-text-primary)] sm:text-2xl md:text-3xl md:leading-none">
            {value}
          </p>
          <StatDocIcon />
        </div>
        <div className="mt-2 sm:mt-3 md:mt-4">
          <p className="text-xs font-semibold leading-snug text-[var(--color-text-primary)] sm:text-sm md:text-base">
            {title}
          </p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight text-[var(--color-primary)] sm:mt-1 sm:text-xs">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Icono documento naranja */
function DocIconSmall({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 ${className ?? ""}`}
      aria-hidden
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    </div>
  );
}

export default function StudentDashboardHome({
  auth,
  onLogout,
  isLoggingOut,
}: Props) {

  // NUEVO STATE
  const [incidents, setIncidents] = useState<IncidentMock[]>([]);

  //  FETCH MINIMO
  useEffect(() => {
    async function fetchData() {
      try {
        const session = await restoreAuthSession();
        if (!session?.accessToken) return;

        const token = session.accessToken;
        const userId = getUserIdFromToken(token);

        const [incRes, catRes] = await Promise.all([
          fetch(`${API}/api/v1/incidents/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/v1/categories/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const incidentsData = await incRes.json();
        const categoriesData = await catRes.json();

        const incidentsArray = Array.isArray(incidentsData)
          ? incidentsData
          : incidentsData.items || [];

        const categoriesArray = categoriesData.items || [];

        const categoryMap: Record<string, string> = {};
        categoriesArray.forEach((cat: any) => {
          categoryMap[cat.id] = cat.name;
        });

        const filtered = incidentsArray.filter(
          (i: any) => i.student_id === userId
        );

        const mapped: IncidentMock[] = filtered
          .sort((a: Record<string, any>, b: Record<string, any>) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 5)
          .map((i: any) => ({
            id: `#${i.id.slice(0, 8).toUpperCase()}`,
            category: categoryMap[i.category_id] || "Sin categoría",
            place: i.campus_place || "Sin ubicación",
            date: new Date(i.created_at).toLocaleDateString(),
            status:
              i.status === "new"
                ? "asignado"
                : i.status === "en_progreso"
                ? "en_progreso"
                : i.status === "resuelto"
                ? "resuelto"
                : i.status === "cerrado"
                ? "cerrado"
                : "asignado",
        }));

        setIncidents(mapped);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  //  CONTADOR DINÁMICO
  const incidentsCount = incidents.length.toString();
  const suggestionsCount = "5";

  // Guard clause: si no hay sesión no renderiza nada
  if (!auth) return <div>cargando...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 pt-0 sm:p-6 lg:px-8">
      {/* === Sección: cabecera del panel — md+: fila clásica; móvil: barra blanca (título centrado) + franja saludo + FAB === */}
      {/* FILA 1: Header */}
      <header className="mb-6 sm:mb-8">
        
        {/* Vista móvil: barra superior blanca + franja gris con saludo (mock); el icono de menú es solo visual (sidebar no va aquí) */}
        <div className="-mx-4 mb-4 md:hidden">
          <div className="border-b border-[var(--color-border-light)] bg-white px-4 py-3">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-primary-border)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]"
                aria-hidden
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
              <p className="text-center text-[18px] font-bold leading-none text-[var(--color-text-primary)] sm:text-xs">
                Panel del Estudiante
              </p>
              <div className="h-10 w-10 shrink-0" aria-hidden />
            </div>
          </div>
          <div className="bg-[var(--color-bg-muted)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-snug text-[var(--color-text-primary)]">
                  ¡Buenos días, {getFirstName(auth.email ?? "Usuario")}!
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Aquí tienes un resumen de tu actividad.
                </p>
              </div>
              <Link
                href="/dashboard/estudiante/incidente"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold leading-none text-white shadow-sm no-underline transition hover:bg-[var(--color-primary-dark)]"
                aria-label="Nuevo Reporte"
              >
                +
              </Link>
            </div>
          </div>
        </div>

        {/* Vista tablet/desktop: título + párrafo + botón primario */}
        <div className="hidden flex-row items-start justify-between gap-3 md:flex">
          <div className="min-w-0 flex-1 pr-1">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Panel del Estudiante
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              ¡Buenos días, {getFirstName(auth.email ?? "Usuario")}! Aquí tienes un
              resumen de tu actividad en el campus.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link
              href="/dashboard/estudiante/incidente"
              className="btn-primary min-w-[200px] text-center no-underline sm:!w-auto"
              aria-label="Nuevo Reporte"
            >
              + Nuevo Reporte
            </Link>
          </div>
        </div>
      </header>

      {/* === Sección: tarjetas de resumen — siempre 2 columnas (misma fila en todos los anchos) === */}
      {/* FILA 2: Tarjetas de stats — layout flex número|icono arriba, títulos abajo */}
      <section className="mb-6 sm:mb-8">
        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-4 lg:gap-6">
          <StatSummaryCard
            value={incidentsCount}
            title="Mis Incidentes"
            subtitle="+1 esta semana"
          />
          <StatSummaryCard
            value={suggestionsCount}
            title="Mis Sugerencias"
            subtitle="Activos ahora"
          />
        </div>
      </section>

      {/* === Sección: grid principal — incidentes (tabla en md+) + sugerencias (columna derecha en lg+) === */}
      {/* FILA 3: Dos columnas — tabla + sugerencias (2/3 + 1/3 en pantallas grandes) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* === Sub-sección: Mis incidentes recientes (tabla desktop / lista tarjetas móvil) === */}
        <section className="card min-h-[200px] lg:col-span-2">
          {/* Barra de título: en móvil título corto "Recientes"; en md+ título completo */}
          <div className="flex w-full min-w-0 flex-row items-center justify-between gap-3 border-b border-[var(--color-border-light)] px-4 py-3">
            <h2 className="min-w-0 flex-1 text-lg font-bold text-[var(--color-text-primary)] md:hidden">
              Recientes
            </h2>
            <h2 className="hidden min-w-0 flex-1 text-lg font-bold text-[var(--color-text-primary)] md:block">
              Mis Incidentes Recientes
            </h2>
            
              <Link
                href="/dashboard/estudiante/incident-list"
                className="btn-link !mt-0 inline-flex !w-auto shrink-0 items-center gap-1 text-left text-sm font-semibold"
              >
              Ver todo
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* Vista tabla: solo desde md (justify-between en barra superior; btn-link anulado con !w-auto en globals) */}
          <div className="hidden overflow-x-auto p-4 md:block">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-muted)] text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                  <th className="rounded-l-md px-3 py-2">ID</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Lugar</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="rounded-r-md px-3 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-[var(--color-text-secondary)]"
                    >
                      No hay ningún incidente
                    </td>
                  </tr>
                ) : (
                  incidents.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--color-border-light)] last:border-0"
                    >
                      <td className="px-3 py-3 font-medium text-[var(--color-primary)]">
                        {row.id}
                      </td>
                      <td className="px-3 py-3">{row.category}</td>
                      <td className="px-3 py-3">{row.place}</td>
                      <td className="px-3 py-3">
                        <IncidentStatusBadge status={row.status} />
                      </td>
                      <td className="px-3 py-3 text-[var(--color-text-secondary)]">
                        {row.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Vista móvil: lista de tarjetas (misma data que MOCK_INCIDENTS) */}
          <ul className="flex flex-col divide-y divide-[var(--color-border-light)] md:hidden">
            {incidents.length === 0 ? (
              <li className="p-4 text-center text-[var(--color-text-secondary)]">
                No hay ningún incidente
              </li>
            ) : (
              incidents.map((row) => (
                <li key={`m-${row.id}`}>
                  <div className="flex items-start gap-3 p-4">
                    <DocIconSmall />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[var(--color-primary)]">{row.id}</p>
                      <p className="text-sm text-[var(--color-text-primary)]">{row.category}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-hint)]">{row.place}</p>
                    </div>
                    <div className="shrink-0 self-center">
                      <IncidentStatusBadge status={row.status} />
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* === Sub-sección: Sugerencias populares (lista vertical; mismo ancho completo en móvil, 1/3 en lg+) === */}
        <section className="card min-h-[200px] lg:col-span-1">
          <div className="border-b border-[var(--color-border-light)] px-4 py-3 text-center">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Sugerencias Populares
            </h2>
          </div>
          <div className="p-3 text-sm text-[var(--color-text-secondary)] sm:p-4">
            <div className="flex flex-col gap-3">
              {/* ITEM */}
              <div className="flex items-center gap-3 card-clickable rounded-lg border-b border-[var(--color-border-light)] p-3">
                {/* VOTOS */}
                {/* text-orange-600: currentColor del SVG hereda aquí (el padre p-4 impone gris con text-secondary) */}
                <div className="flex min-w-[60px] flex-col items-center justify-center rounded-lg border border-orange-300 bg-orange-50 px-2 py-1 text-orange-600">
                  <svg
                    className="-rotate-90"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="text-lg font-bold text-orange-600">124</span>
                  <span className="text-[10px] font-semibold text-orange-500">
                    VOTOS
                  </span>
                </div>

                {/* CONTENIDO */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    Más puntos de reciclaje en bloques de clases
                  </span>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="badge">Sostenibilidad</span>
                    <span className="text-[var(--color-text-hint)]">
                      Hace 3 días
                    </span>
                  </div>
                </div>
              </div>

              {/* ITEM */}
              <div className="flex items-center gap-3 card-clickable rounded-lg border-b border-[var(--color-border-light)] p-3">
                {/* VOTOS */}
                {/* text-orange-600: currentColor del SVG hereda aquí (el padre p-4 impone gris con text-secondary) */}
                <div className="flex min-w-[60px] flex-col items-center justify-center rounded-lg border badge-closed">
                  <svg
                    className="-rotate-90"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="text-lg font-bold text-closed">98</span>
                  <span className="text-[10px] font-semibold text-closed">
                    VOTOS
                  </span>
                </div>

                {/* CONTENIDO */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    Ampliar horario de biblioteca en parciales
                  </span>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="badge">Bienestar</span>
                    <span className="text-[var(--color-text-hint)]">
                      Hace 5 días
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// sm:   ≥ 640px   → tablets pequeñas
// md:   ≥ 768px   → tablets
// lg:   ≥ 1024px  → laptops
// xl:   ≥ 1280px  → monitores
// 2xl:  ≥ 1536px  → monitores grandes
