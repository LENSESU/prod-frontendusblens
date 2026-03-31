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
import StudentSidebar from "@/components/StudentSidebar";

export default function EstudianteDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const restored = await restoreAuthSession();
      if (!isMounted) return;

      if (!restored) {
        router.replace("/login/estudiante");
        return;
      }

      const role = normalizeRole(restored.role);
      if (role !== "student") {
        router.replace(getDashboardPathByRole(restored.role));
        return;
      }

      setAuth(restored);
      setIsReady(true);
    }

    void init();
    return () => { isMounted = false; };
  }, [router]);

  function handleLogout() {
    setIsLoggingOut(true);
    clearAuth();
    router.replace("/login/estudiante");
  }

  if (!isReady) return null;

  return (
    <div className="dashboard-layout">
      <StudentSidebar auth={auth} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}