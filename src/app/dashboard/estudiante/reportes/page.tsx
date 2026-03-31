// quien tenga la tarea de implementar esta página, 
// puede usar este page que use de prueba para el sidebar. 

export default function MisReportesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 pt-0 sm:p-6 lg:px-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Mis Reportes
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Historial completo de tus incidentes reportados.
        </p>
      </header>

      <div className="card">
        <div className="card-stripe" />
        <div className="card-body-center">
          <div className="icon-wrap-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <p className="font-semibold text-[var(--color-text-primary)]">Próximamente</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Aquí podrás ver y filtrar todos tus reportes.
          </p>
        </div>
      </div>
    </div>
  );
}