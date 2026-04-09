import { createContext } from "react";
import type { AuthSession } from "../../types/auth";

export type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  refreshAuthState: () => void;
  logout: (logoutAll: boolean) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
