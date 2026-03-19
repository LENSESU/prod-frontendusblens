"use client";

type Props = {
  open: boolean;
  message: string;
  isError?: boolean;
  onClose: () => void;
};

export default function IncidentResponseModal({
  open,
  message,
  isError = false,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div
        className={`modal-container ${
          isError ? "modal-error" : "modal-success"
        }`}
      >
        <div className="modal-stripe" />

        <div className="modal-body">
          <h2 className="modal-title">
            {isError ? "Hubo un problema" : "Incidente reportado"}
          </h2>

          <p className="modal-message">{message}</p>

          <button className="btn-primary w-full" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}