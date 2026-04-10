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

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(base64 + pad);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value === "string") {
    return value
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function extractRoles(token: TokenResponse): { role?: string; roles?: string[] } {
  const explicitRoles = toStringArray(token.roles);
  const explicitRole = typeof token.role === "string" && token.role.trim() ? token.role.trim() : undefined;

  if (explicitRole || explicitRoles.length > 0) {
    const combined = Array.from(new Set([...(explicitRole ? [explicitRole] : []), ...explicitRoles]));
    return { role: combined[0], roles: combined };
  }

  const payload = decodeJwtPayload(token.accessToken);
  if (!payload) return {};

  const roles = Array.from(
    new Set([
      ...toStringArray(payload.roles),
      ...toStringArray(payload.authorities),
      ...toStringArray(payload.scope),
      ...toStringArray(payload.scp),
      ...toStringArray(payload.role),
    ])
  );

  return roles.length > 0 ? { role: roles[0], roles } : {};
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
  const roleInfo = extractRoles(token);
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    accessTokenExpiresAt: token.accessExpiresInSec ? now + token.accessExpiresInSec : undefined,
    refreshTokenExpiresAt: token.refreshExpiresInSec ? now + token.refreshExpiresInSec : undefined,
    deviceId: getOrCreateDeviceId(),
    role: roleInfo.role,
    roles: roleInfo.roles,
  };
}
