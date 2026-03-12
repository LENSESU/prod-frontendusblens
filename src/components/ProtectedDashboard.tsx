"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type AuthData,
  type NormalizedRole,
  getDashboardPathByRole,
  logoutSession,
  normalizeRole,
  restoreAuthSession,
} from "@/utils/auth";

type ProtectedDashboardProps = {
  title: string;
  description: string;
  allowedRoles: NormalizedRole[];
  loginPath: string;
};

export default function ProtectedDashboard({
  title,
  description,
  allowedRoles,
  loginPath,
}: ProtectedDashboardProps) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const restoredAuth = await restoreAuthSession();

      if (!isMounted) return;

      if (!restoredAuth) {
        router.replace(loginPath);
        return;
      }

      const normalizedRole = normalizeRole(restoredAuth.role);
      if (!normalizedRole) {
        router.replace("/");
        return;
      }

      if (!allowedRoles.includes(normalizedRole)) {
        router.replace(getDashboardPathByRole(restoredAuth.role));
        return;
      }

      setAuth(restoredAuth);
      setIsLoading(false);
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, loginPath, router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logoutSession();
    router.replace(loginPath);
  }

  if (isLoading) return null;

  return (
    <div className="page-centered">
      <div className="form-wrapper">
        <div className="card">
          <div className="card-stripe" />
          <div className="card-body-center">
            <h1 className="card-form-title">{title}</h1>
            <p className="card-desc">{description}</p>

            {auth?.email ? (
              <p className="otp-hint">
                Sesión activa como <strong>{auth.email}</strong>
              </p>
            ) : null}

            <button
              type="button"
              className="btn-secondary"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </div>
        </div>

        <p className="page-footer">
          © {new Date().getFullYear()} Universidad San Buenaventura Cali · USB LENS
        </p>
      </div>
    </div>
  );
}
