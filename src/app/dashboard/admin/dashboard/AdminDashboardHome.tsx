"use client";

import { useEffect, useState } from "react";

type Props = {
  auth: any;
  onLogout: () => void;
  isLoggingOut: boolean;
};

type Incident = {
  id: string;
  category: string;
  user: string;
  status: string;
  priority: string;
  place: string;
  date: string;
};

function getFirstName(email: string) {
  return email.split("@")[0];
}

function selectClass(active: boolean) {
  return active
    ? "text-xs px-3 py-1 rounded-full font-semibold cursor-pointer border-2 border-orange-500 bg-orange-500 text-white shadow-sm focus:outline-none transition-all"
    : "text-xs px-3 py-1 rounded-full font-medium cursor-pointer border border-[var(--color-border-light)] bg-white text-[var(--color-text-primary)] hover:border-orange-400 hover:text-orange-500 focus:outline-none transition-all";
}

function selectClassMobile(active: boolean) {
  return active
    ? "text-[11px] px-3 py-1.5 w-full rounded-full font-semibold cursor-pointer border-2 border-orange-500 bg-orange-500 text-white shadow-sm focus:outline-none transition-all"
    : "text-[11px] px-3 py-1.5 w-full rounded-full font-medium cursor-pointer border border-[var(--color-border-light)] bg-white text-[var(--color-text-primary)] hover:border-orange-400 hover:text-orange-500 focus:outline-none transition-all";
}

export default function AdminDashboardHome({ auth }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filtros ──
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterPriority, setFilterPriority] = useState("Todas");
  const [filterCategory, setFilterCategory] = useState("Todas");

  useEffect(() => {
    setTimeout(() => {
      setIncidents([
        {
          id: "#A1B2C3D4",
          category: "Infraestructura",
          user: "juan@usb.edu",
          status: "Pendiente",
          priority: "Alta",
          place: "Bloque A",
          date: "10/04/2026",
        },
        {
          id: "#E5F6G7H8",
          category: "Seguridad",
          user: "ana@usb.edu",
          status: "En progreso",
          priority: "Media",
          place: "Biblioteca",
          date: "09/04/2026",
        },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  // ── Lógica de filtrado ──
  const filtered = incidents.filter((i) => {
    const matchStatus = filterStatus === "Todos" || i.status === filterStatus;
    const matchPriority = filterPriority === "Todas" || i.priority === filterPriority;
    const matchCategory = filterCategory === "Todas" || i.category === filterCategory;
    return matchStatus && matchPriority && matchCategory;
  });

  const hasActiveFilters =
    filterStatus !== "Todos" || filterPriority !== "Todas" || filterCategory !== "Todas";

  const clearFilters = () => {
    setFilterStatus("Todos");
    setFilterPriority("Todas");
    setFilterCategory("Todas");
  };

  if (!auth) return <div>cargando...</div>;

  // ── Selects reutilizables ──
  const FilterSelects = ({ mobile }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col gap-2" : "flex items-center justify-center gap-7 px-8"}>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className={mobile ? selectClassMobile(filterStatus !== "Todos") : selectClass(filterStatus !== "Todos")}
      >
        <option value="Todos">Todos los estados</option>
        <option value="Nuevo">Nuevo</option>
        <option value="Pendiente">Pendiente</option>
        <option value="En progreso">En progreso</option>
        <option value="Resuelto">Resuelto</option>
      </select>

      <select
        value={filterPriority}
        onChange={(e) => setFilterPriority(e.target.value)}
        className={mobile ? selectClassMobile(filterPriority !== "Todas") : selectClass(filterPriority !== "Todas")}
      >
        <option value="Todas">Todas las prioridades</option>
        <option value="Alta">Alta</option>
        <option value="Media">Media</option>
        <option value="Baja">Baja</option>
      </select>

      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className={mobile ? selectClassMobile(filterCategory !== "Todas") : selectClass(filterCategory !== "Todas")}
      >
        <option value="Todas">Todas las categorías</option>
        <option value="Infraestructura">Infraestructura</option>
        <option value="Seguridad">Seguridad</option>
        <option value="Mantenimiento">Mantenimiento</option>
      </select>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 pt-0 sm:p-6 lg:px-8">

      {/* ================= HEADER ================= */}
      <header className="mb-6 sm:mb-8">

        {/* ===== MOBILE ===== */}
        <div className="-mx-4 mb-4 md:hidden">
          <div className="border-b border-[var(--color-border-light)] bg-white px-4 py-3">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-primary-border)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>

              <p className="text-center text-[18px] font-bold text-[var(--color-text-primary)]">
                Panel Administrador
              </p>

              <div className="h-10 w-10" />
            </div>
          </div>

          <div className="bg-[var(--color-bg-muted)] px-4 py-4">
            <p className="font-bold text-[var(--color-text-primary)]">
              ¡Hola, {getFirstName(auth.email ?? "Admin")}!
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Gestión general del sistema.
            </p>

            <h2 className="mt-4 text-2xl font-bold text-[var(--color-text-primary)] text-center">
              Gestión de incidentes
            </h2>

            {/* ===== FILTROS MOBILE ===== */}
            <div className="mt-3 card p-3 w-full">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  Filtros
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[11px] text-[var(--color-primary)] hover:underline">
                    Limpiar
                  </button>
                )}
              </div>
              <FilterSelects mobile />
            </div>
          </div>
        </div>

        {/* ===== DESKTOP ===== */}
        <div className="hidden md:flex justify-between items-start">
          <div className="w-full">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Panel Administrador
            </h1>

            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Bienvenido, {getFirstName(auth.email ?? "Admin")}
            </p>

            <h2 className="mt-4 text-3xl font-bold text-[var(--color-text-primary)] text-center">
              Gestión de incidentes
            </h2>

            {/* ===== FILTROS DESKTOP ===== */}
            <div className="mt-3 card p-3 w-full">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  Filtros
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-[var(--color-primary)] hover:underline">
                    Limpiar filtros
                  </button>
                )}
              </div>
              <FilterSelects />
            </div>
          </div>
        </div>
      </header>

      {/* ================= TABLA ================= */}
      <section className="card">
        <div className="border-b px-4 py-3 font-semibold">
          Incidentes Recientes
          {hasActiveFilters && (
            <span className="ml-2 text-xs font-normal text-[var(--color-text-secondary)]">
              ({filtered.length} resultado{filtered.length !== 1 ? "s" : ""})
            </span>
          )}
        </div>

        {/* ===== DESKTOP ===== */}
        <div className="hidden md:block p-4">
          {loading ? (
            <p>Cargando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] py-6 text-center">
              No hay incidentes con los filtros seleccionados.
            </p>
          ) : (
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-muted)] text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                  <th className="rounded-l-md px-3 py-2">ID</th>
                  <th className="px-3 py-2">Categoría</th>
                  <th className="px-3 py-2">Usuario</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Prioridad</th>
                  <th className="px-3 py-2">Lugar</th>
                  <th className="rounded-r-md px-3 py-2">Fecha</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-muted)] transition"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--color-primary)]">
                      {i.id}
                    </td>
                    <td className="px-3 py-3">{i.category}</td>
                    <td className="px-3 py-3">{i.user}</td>

                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        i.status === "Pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : i.status === "En progreso"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {i.status}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        i.priority === "Alta"
                          ? "bg-red-100 text-red-700"
                          : i.priority === "Media"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {i.priority}
                      </span>
                    </td>

                    <td className="px-3 py-3">{i.place}</td>
                    <td className="px-3 py-3 text-[var(--color-text-secondary)]">{i.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ===== MOBILE ===== */}
        <ul className="md:hidden divide-y">
          {loading ? (
            <li className="p-4 text-sm">Cargando...</li>
          ) : filtered.length === 0 ? (
            <li className="p-4 text-sm text-[var(--color-text-secondary)]">
              No hay incidentes con los filtros seleccionados.
            </li>
          ) : (
            filtered.map((i) => (
              <li key={i.id} className="p-4">
                <p className="font-semibold text-[var(--color-primary)]">{i.id}</p>
                <p className="text-sm">{i.category}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{i.user}</p>
                <p className="text-xs">Estado: {i.status} · Prioridad: {i.priority}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{i.place} · {i.date}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}