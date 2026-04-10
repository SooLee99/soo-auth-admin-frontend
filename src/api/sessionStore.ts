import type { AuthSession, TokenResponse } from "../types/auth";

const STORAGE_KEY = "auth.session";
const DEVICE_ID_KEY = "auth.deviceId";

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `dev-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

export function getOrCreateDeviceId(): string {
  const existing = sessionStorage.getItem(DEVICE_ID_KEY)?.trim();
  if (existing) return existing;
  const created = randomId();
  sessionStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

export function getDeviceId(): string {
  return getOrCreateDeviceId();
}

export function loadSession(): AuthSession | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.deviceId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  sessionStorage.setItem(DEVICE_ID_KEY, session.deviceId);
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function buildSessionFromToken(token: TokenResponse): AuthSession {
  const now = nowSec();
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    accessTokenExpiresAt: token.accessExpiresInSec ? now + token.accessExpiresInSec : undefined,
    refreshTokenExpiresAt: token.refreshExpiresInSec ? now + token.refreshExpiresInSec : undefined,
    deviceId: getOrCreateDeviceId(),
  };
}
