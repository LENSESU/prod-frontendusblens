"use client";

import ProtectedDashboard from "@/components/ProtectedDashboard";

export default function DashboardAdminPage() {
  return (
    <ProtectedDashboard
      title="Dashboard Admin"
      description="Sesión iniciada correctamente como administrador."
      allowedRoles={["administrator"]}
      loginPath="/login/personal"
    />
  );
}
