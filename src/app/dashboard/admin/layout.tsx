"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  restoreAuthSession,
  normalizeRole,
  getDashboardPathByRole,
  clearAuth,
  type AuthData,
} from "@/utils/auth";

import AdminSidebar from "@/components/AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const session = await restoreAuthSession();

        if (!isMounted) return;

        //  No hay sesión
        if (!session) {
          router.replace("/login/personal");
          return;
        }

        // Validar rol
        const role = normalizeRole(session.role);

        if (role !== "administrator") {
          router.replace(getDashboardPathByRole(session.role));
          return;
        }

      
        setAuth(session);
        setIsReady(true);
      } catch (error) {
        console.error("Error cargando sesión:", error);
        router.replace("/login/personal");
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleLogout() {
    setIsLoggingOut(true);
    clearAuth(); 
    router.replace("/login/personal");
  }

  // Loader (evita pantalla blanca)
  if (!isReady) {
    return (
      <div className="page-centered">
        <p>Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <AdminSidebar
        auth={auth}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Contenido */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}