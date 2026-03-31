"use client";

// Valores del enum Campus definido en el backend (schemas/incident.py)
// Si el backend los cambia, actualizar aquí también.
const CAMPUS_OPTIONS = [
  { value: "Biblioteca",              label: "Biblioteca" },
  { value: "Lago",                    label: "Lago" },
  { value: "Cedro",                   label: "Cedro" },
  { value: "Central",                 label: "Central" },
  { value: "Farrallones",             label: "Farrallones" },
  { value: "Parqueadero_estudiantes", label: "Parqueadero estudiantes" },
  { value: "Parque tecnologico",      label: "Parque tecnológico" },
  { value: "Naranjos",                label: "Naranjos" },
  { value: "Higuerones",              label: "Higuerones" },
  { value: "Cancha",                  label: "Cancha" },
  { value: "Otros",                   label: "Otros" },
] as const;

type CampusValue = (typeof CAMPUS_OPTIONS)[number]["value"];

type LocationFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function LocationField({ value, onChange, error }: LocationFieldProps) {
  return (
    <div className="field">
      <label htmlFor="location">
        Ubicacion <span className="field-required">*</span>
      </label>

      <select
        id="location"
        value={value}
        onChange={(e) => onChange(e.target.value as CampusValue)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "location-error" : "location-help"}
        className={error ? "input-error" : ""}
      >
        <option value="">Selecciona una ubicación en el campus</option>
        {CAMPUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p id="location-error" className="field-error-text">{error}</p>
      ) : (
        <p id="location-help" className="field-hint">
          Selecciona el lugar del campus donde ocurrió el incidente.
        </p>
      )}
    </div>
  );
}