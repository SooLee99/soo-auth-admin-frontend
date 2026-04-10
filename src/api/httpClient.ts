import type { ApiEnvelope } from "../types/api";
import type { TokenResponse } from "../types/auth";
import { buildSessionFromToken, clearSession, getDeviceId, loadSession, saveSession } from "./sessionStore";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status = 0, payload: unknown = null) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
  withDeviceId?: boolean;
  retry401?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

function toErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const data = payload as { error?: { message?: string } | string | null; message?: string };
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
    if (data.error && typeof data.error === "object" && typeof data.error.message === "string") return data.error.message;
  }
  return fallback;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "result" in payload && "data" in payload) {
    const env = payload as ApiEnvelope<T>;
    if (env.result !== "SUCCESS") {
      throw new ApiError(toErrorMessage(payload, "API 요청에 실패했습니다."), 400, payload);
    }
    return env.data;
  }
  return payload as T;
}

export function normalizeTokenPayload(payload: unknown): TokenResponse {
  if (!payload || typeof payload !== "object") {
    throw new ApiError("토큰 응답이 비어 있습니다.");
  }

  const d = payload as Record<string, unknown>;
  const accessToken = String(d.accessToken ?? d.access_token ?? "").trim();
  const refreshToken = String(d.refreshToken ?? d.refresh_token ?? "").trim();
  if (!accessToken || !refreshToken) {
    throw new ApiError("토큰 응답 필드가 유효하지 않습니다.");
  }

  const accessExpiresInSec = Number(d.accessExpiresInSec ?? d.access_expires_in_sec);
  const refreshExpiresInSec = Number(d.refreshExpiresInSec ?? d.refresh_expires_in_sec);

  return {
    accessToken,
    refreshToken,
    accessExpiresInSec: Number.isFinite(accessExpiresInSec) ? accessExpiresInSec : undefined,
    refreshExpiresInSec: Number.isFinite(refreshExpiresInSec) ? refreshExpiresInSec : undefined,
  };
}

async function performRefresh(): Promise<boolean> {
  const session = loadSession();
  if (!session?.refreshToken) return false;

  const payload = {
    refreshToken: session.refreshToken,
  };

  const attempt = async (path: string): Promise<boolean> => {
    try {
      const data = await request<unknown>(path, {
        method: "POST",
        auth: false,
        withDeviceId: true,
        retry401: false,
        body: JSON.stringify(payload),
      });
      const token = normalizeTokenPayload(data);
      saveSession(buildSessionFromToken(token));
      return true;
    } catch {
      return false;
    }
  };

  const preferredOk = await attempt("/api/v1/auth/token/refresh");
  if (preferredOk) return true;

  // Compatibility path: keep fallback only when legacy backend is still in use.
  const legacyOk = await attempt("/api/v1/auth/local/token/refresh");
  if (legacyOk) return true;

  clearSession();
  return false;
}

async function refreshIfNeeded(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    auth = true,
    withDeviceId = false,
    retry401 = true,
    headers,
    body,
    ...rest
  } = options;

  const requestHeaders = new Headers(headers ?? {});
  if (!requestHeaders.has("Content-Type") && body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }
  requestHeaders.set("Accept", "application/json");

  if (auth) {
    const session = loadSession();
    const accessToken = session?.accessToken;
    if (!accessToken) {
      throw new ApiError("로그인이 필요합니다.", 401);
    }
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  if (withDeviceId) {
    requestHeaders.set("X-Device-Id", getDeviceId());
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
    body,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (response.status === 401 && auth && retry401) {
    const refreshed = await refreshIfNeeded();
    if (refreshed) {
      return request<T>(path, { ...options, retry401: false });
    }
  }

  if (!response.ok) {
    throw new ApiError(toErrorMessage(payload, `HTTP ${response.status}`), response.status, payload);
  }

  return unwrapEnvelope<T>(payload);
}
