"use client";

import ProtectedDashboard from "@/components/ProtectedDashboard";

export default function DashboardTecnicoPage() {
  return (
    <ProtectedDashboard
      title="Dashboard Técnico"
      description="Sesión iniciada correctamente como técnico."
      allowedRoles={["technician"]}
      loginPath="/login/personal"
    />
  );
}
