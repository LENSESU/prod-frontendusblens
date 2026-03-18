"use client";

import { useState } from "react";

// por ahora hasta que backend diga como traerlo lo deje asi para verlo bien
const LOCATION_SUGGESTIONS = [
  "Cedro — salon 201",
  "Farallones — salon 201",
  "Parque Tecnologico — 201",
  "Lago — 201",
];

const LOCATION_MAX = 150;

type LocationFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function LocationField({ value, onChange, error }: LocationFieldProps) {
  const [locationQuery, setLocationQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = LOCATION_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(locationQuery.toLowerCase())
  );

  function selectSuggestion(suggestion: string) {
    onChange(suggestion);
    setLocationQuery(suggestion);
    setShowSuggestions(false);
  }

  return (
    <div className="field location-field">
      <label htmlFor="location">
        Ubicacion <span className="field-required">*</span>
      </label>

      <div className="location-hint-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span>En el próximo sprint se implementará captura automática de ubicación GPS.</span>
      </div>

      <div className="location-input-wrap">
        <input
          id="location"
          type="text"
          placeholder="Ej: Bloque B — Laboratorio de Sistemas, piso 2"
          value={value}
          maxLength={LOCATION_MAX}
          onChange={(e) => {
            onChange(e.target.value);
            setLocationQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "location-error" : "location-help"}
          aria-autocomplete="list"
          aria-controls="location-suggestions"
          className={error ? "input-error" : ""}
          autoComplete="off"
        />
        <span className="location-pin-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </span>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul
            id="location-suggestions"
            className="location-suggestions"
            role="listbox"
            aria-label="Sugerencias de ubicación"
          >
            {filteredSuggestions.slice(0, 6).map((s) => (
              <li
                key={s}
                role="option"
                aria-selected={value === s}
                className={`location-suggestion-item ${value === s ? "suggestion-active" : ""}`}
                onMouseDown={() => selectSuggestion(s)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error
        ? <p id="location-error" className="field-error-text">{error}</p>
        : <p id="location-help" className="field-hint">Escribe el bloque, salon o zona. Puedes seleccionar una sugerencia.</p>
      }
    </div>
  );
}