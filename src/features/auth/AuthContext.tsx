import { useMemo, useState, type PropsWithChildren } from "react";
import { logout as apiLogout } from "../../api/authApi";
import { clearSession, loadSession } from "../../api/sessionStore";
import type { AuthSession } from "../../types/auth";
import { AuthContext, type AuthContextValue } from "./context";

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [session, setSession] = useState<AuthSession | null>(loadSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      refreshAuthState: () => {
        setSession(loadSession());
      },
      logout: async (logoutAll: boolean) => {
        try {
          await apiLogout(logoutAll);
        } finally {
          clearSession();
          setSession(null);
        }
      },
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
