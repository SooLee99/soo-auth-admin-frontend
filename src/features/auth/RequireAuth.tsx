import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

function isAdminRole(value?: string): boolean {
  if (!value) return false;
  const normalized = value.toUpperCase();
  return normalized === "ADMIN" || normalized === "ROLE_ADMIN" || normalized.includes("ADMIN");
}

export default function RequireAuth(): JSX.Element {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const roles = Array.from(new Set([...(session?.roles ?? []), ...(session?.role ? [session.role] : [])]));
  const isAdmin = roles.some((role) => isAdminRole(role));

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: "관리자 계정만 접근할 수 있습니다." }} />;
  }

  return <Outlet />;
}
