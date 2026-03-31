"use client";

import ProtectedDashboard from "@/components/ProtectedDashboard";

type IconProps = { className?: string };

function IconShield({ className }: IconProps) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 3l7 3v6c0 4.5-2.7 7.8-7 9-4.3-1.2-7-4.5-7-9V6l7-3z" />
		</svg>
	);
}

function IconDoc({ className }: IconProps) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M7 3h7l5 5v13H7V3zm7 1.5V9h4.5" />
		</svg>
	);
}

function IconPrint({ className }: IconProps) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M7 8V3h10v5M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2m-10 4v-6h10v6H7z" />
		</svg>
	);
}

function IconShare({ className }: IconProps) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M16 6a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zm10 9a3 3 0 100-6 3 3 0 000 6zM8.6 10.8l4.9-2.6m-4.9 5l4.9 2.6" />
		</svg>
	);
}

function IconInfo({ className }: IconProps) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 6h.01M11 11h2v6h-2z" />
		</svg>
	);
}

function IconLocation({ className }: IconProps) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 21s7-4.7 7-11a7 7 0 10-14 0c0 6.3 7 11 7 11zm0-8a3 3 0 100-6 3 3 0 000 6z" />
		</svg>
	);
}

function IconCamera({ className }: IconProps) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M9 4h6l1 2h3a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3l1-2zm3 13a4 4 0 100-8 4 4 0 000 8z" />
		</svg>
	);
}

export default function EstudianteIncidenteDetallePage() {
	return (
		<ProtectedDashboard
			title="Detalle de incidente"
			description="Vista de detalle para incidentes."
			allowedRoles={["student"]}
			loginPath="/login/estudiante"
		>
			{() => (
				<div className="min-h-screen bg-[var(--color-bg-page)] text-slate-700">
					<div className="mx-auto max-w-[1280px]">
						<main className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
							<header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
								<div>
									<p className="mb-2 text-xs font-semibold text-slate-500">
										Panel Estudiante <span className="px-1 text-slate-300">›</span>{" "}
										<span className="text-[var(--color-primary)]">Detalle del Incidente</span>
									</p>
									<h1 className="text-3xl font-black tracking-tight text-slate-900">
										Incidente #2023-08-15-001
									</h1>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<button
										type="button"
										className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
									>
										<IconPrint className="h-4 w-4 fill-none stroke-current stroke-2" />
										Imprimir
									</button>
									<button
										type="button"
										className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(239,99,15,0.22)] transition hover:bg-[var(--color-primary-dark)]"
									>
										<IconShare className="h-4 w-4 fill-none stroke-current stroke-2" />
										Compartir
									</button>
								</div>
							</header>

							<section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="rounded-2xl bg-white p-5 shadow-sm">
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
											<IconShield className="h-6 w-6 fill-none stroke-current stroke-2" />
										</div>
										<div>
											<p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
												ID del incidente
											</p>
											<p className="mt-1 text-base font-black text-[var(--color-primary)]">
												ID-2023-08-15-001
											</p>
										</div>
									</div>
								</div>

								<div className="rounded-2xl bg-white p-5 shadow-sm">
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
											<IconInfo className="h-6 w-6 fill-none stroke-current stroke-2" />
										</div>
										<div>
											<p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
												Estado actual
											</p>
											<p className="mt-1 flex items-center gap-2 text-base font-black uppercase text-slate-800">
												<span className="h-2 w-2 rounded-full bg-blue-500" />
												Nuevo
											</p>
										</div>
									</div>
								</div>
							</section>

							<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
								<section className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-6">
									<div className="mb-7 flex items-center gap-2">
										<IconDoc className="h-5 w-5 fill-none stroke-slate-400 stroke-2" />
										<h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
											Informacion del reporte
										</h2>
									</div>

									<span className="inline-flex rounded-md bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
										Reporte de estudiante
									</span>

									<div className="mt-6 space-y-5">
										<div>
											<p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
												Categoria
											</p>
											<p className="mt-1 text-base font-bold text-slate-800">
												Mantenimiento - Infraestructura
											</p>
										</div>

										<div>
											<p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
												Descripcion
											</p>
											<div className="mt-2 rounded-xl bg-slate-50 p-4">
												<p className="text-sm leading-relaxed text-slate-600">
													Fuga de agua en el techo del laboratorio 3, cerca de los servicios.
													Hay varios equipos en riesgo. Anexo foto de la afectacion.
												</p>
											</div>
										</div>
									</div>

									<div className="mt-7 overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 p-4">
										<div className="h-32 rounded-lg bg-gradient-to-tr from-slate-400/70 via-slate-300/40 to-slate-100/80" />
										<div className="mt-3 flex items-start gap-2">
											<IconLocation className="h-5 w-5 fill-none stroke-[var(--color-primary)] stroke-2" />
											<div>
												<p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
													Ubicacion detallada
												</p>
												<p className="text-sm font-bold text-slate-800">Edificio C, Laboratorio 3</p>
											</div>
										</div>
									</div>
								</section>

								<section className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-6">
									<div className="mb-7 flex items-center gap-2">
										<IconCamera className="h-5 w-5 fill-none stroke-slate-400 stroke-2" />
										<h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
											Evidencia visual
										</h2>
									</div>

									<div className="space-y-6">
										<div>
											<div className="mb-2 flex items-center justify-between">
												<p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
													Antes (reporte)
												</p>
												<span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
													JPG
												</span>
											</div>
											<div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br from-slate-500/70 to-slate-200">
												<span className="rounded-lg bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-500">
													IMG_BEFORE.JPG
												</span>
											</div>
										</div>

										<div>
											<p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
												Resolucion (pendiente)
											</p>
											<div className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
												<IconCamera className="h-8 w-8 fill-none stroke-slate-300 stroke-2" />
												<p className="mt-2 text-xs font-bold text-slate-400">
													Subir foto de resolucion
												</p>
											</div>
										</div>
									</div>
								</section>

							</div>

							<footer className="mt-10 border-t border-[var(--color-border-light)] pt-7">
								<p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
									© 2026 Universidad de San Buenaventura Cali - Sistema de Gestion USB Lens
								</p>
							</footer>
						</main>
					</div>
				</div>
			)}
		</ProtectedDashboard>
	);
}
