import type {
  AdminLoginPayload,
  OAuthProvider,
} from "../types/auth";
import { normalizeTokenPayload, request } from "./httpClient";
import { buildSessionFromToken, clearSession, getDeviceId, loadSession, saveSession } from "./sessionStore";

export async function loginAdmin(payload: AdminLoginPayload): Promise<void> {
  const data = await request<unknown>("/api/v1/auth/admin/login", {
    method: "POST",
    auth: false,
    withDeviceId: true,
    body: JSON.stringify(payload),
  });
  saveSession(buildSessionFromToken(normalizeTokenPayload(data)));
}

export async function logout(logoutAll: boolean): Promise<void> {
  const session = loadSession();
  try {
    // Local logout endpoint is kept intentionally for compatibility.
    await request<unknown>("/api/v1/auth/local/logout", {
      method: "POST",
      auth: true,
      withDeviceId: true,
      body: JSON.stringify({
        refreshToken: session?.refreshToken,
        logoutAll,
      }),
    });
  } finally {
    clearSession();
  }
}

export async function refreshSession(): Promise<void> {
  const session = loadSession();
  if (!session?.refreshToken) {
    throw new Error("refreshToken 이 없습니다.");
  }

  const data = await request<unknown>("/api/v1/auth/token/refresh", {
    method: "POST",
    auth: false,
    withDeviceId: true,
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  saveSession(buildSessionFromToken(normalizeTokenPayload(data)));
}

export async function getOAuthAuthorizeUrl(provider: OAuthProvider, returnUrl: string): Promise<string> {
  if (!returnUrl.startsWith("/")) {
    throw new Error("returnUrl 은 '/' 로 시작하는 상대 경로만 허용됩니다.");
  }

  const query = new URLSearchParams({ returnUrl }).toString();
  return request<string>(`/api/v1/auth/oauth2/${encodeURIComponent(provider)}/authorize-url?${query}`, {
    method: "GET",
    auth: false,
    withDeviceId: true,
  });
}

export function getCurrentDeviceId(): string {
  return getDeviceId();
}
