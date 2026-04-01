export default function MisSugerenciasPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 pt-0 sm:p-6 lg:px-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Mis Sugerencias
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Historial completo de tus sugerencias realizadas.
        </p>
      </header>

      <div className="card">
        <div className="card-stripe" />
        <div className="card-body-center">
          <div className="icon-wrap-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="font-semibold text-[var(--color-text-primary)]">Próximamente</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Aquí podrás ver y gestionar todas tus sugerencias.
          </p>
        </div>
      </div>
    </div>
  );
}