"use client";

import ProtectedDashboard from "@/components/ProtectedDashboard";

export default function EstudianteDashboard() {
  return (
    <ProtectedDashboard
      title="Dashboard Estudiante"
      description="Sesión iniciada correctamente como estudiante."
      allowedRoles={["student"]}
      loginPath="/login/estudiante"
    />
  );
}
