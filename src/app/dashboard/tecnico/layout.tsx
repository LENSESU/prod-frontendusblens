"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  restoreAuthSession,
  normalizeRole,
  getDashboardPathByRole,
  logoutSession,
  type AuthData,
} from "@/utils/auth";
import TechnicianSidebar from "@/components/TechnicianSidebar";

export default function TecnicoDashboardLayout({
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

        if (!session) {
          router.replace("/login/personal");
          return;
        }

        const role = normalizeRole(session.role);
        if (role !== "technician") {
          router.replace(getDashboardPathByRole(session.role));
          return;
        }

        setAuth(session);
        setIsReady(true);
      } catch (error) {
        console.error("Error cargando sesion:", error);
        router.replace("/login/personal");
      }
    }

    void init();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutSession();
    } finally {
      router.replace("/login/personal");
    }
  }

  if (!isReady) {
    return (
      <div className="page-centered">
        <p>Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <TechnicianSidebar
        auth={auth}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
