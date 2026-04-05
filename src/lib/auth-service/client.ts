import type {
    ApiResponse,
    LoginHistoryItem,
    LoginPayload,
    PageResponse,
    TokenPayload,
    UserDetail,
    UserListItem,
    UserStatusAuditItem,
    UserStatusItem,
    UserUpdatePayload,
    SmsLogItem,
    SmsStatsItem,
    HealthSnapshot,
} from "../../types/auth-service";
import {clearSession, getAccessToken, getDeviceId, getRefreshToken, setTokens} from "./session";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
const FRONT_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function redirectToLogin(reason: "login-required" | "expired" = "login-required"): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("auth_redirect_reason", reason);
    window.location.replace(`${FRONT_BASE}/login`);
}

export class AuthServiceError extends Error {
    readonly status: number;
    readonly payload: unknown;

    constructor(message: string, status = 0, payload: unknown = null) {
        super(message);
        this.name = "AuthServiceError";
        this.status = status;
        this.payload = payload;
    }
}

function buildUrl(path: string): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

function toApiErrorMessage(payload: unknown, fallback: string): string {
    if (payload && typeof payload === "object") {
        const p = payload as { error?: { message?: string } | string | null };
        if (typeof p.error === "string") return p.error;
        if (p.error && typeof p.error === "object" && typeof p.error.message === "string") return p.error.message;
    }
    return fallback;
}

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
    return Boolean(payload && typeof payload === "object" && "result" in payload);
}

function parseTokenPayload(payload: unknown): TokenPayload {
    if (!payload || typeof payload !== "object") {
        throw new AuthServiceError("토큰 응답이 올바르지 않습니다.");
    }

    const d = payload as Record<string, unknown>;
    const accessToken = (d.accessToken ?? d.access_token ?? "").toString();
    const refreshToken = (d.refreshToken ?? d.refresh_token ?? "").toString();

    if (!accessToken || !refreshToken) {
        throw new AuthServiceError("토큰이 누락되었습니다.");
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

type RequestInitExt = RequestInit & {
    skipAuth?: boolean;
    withDeviceId?: boolean;
    retry401?: boolean;
};

async function request<T>(path: string, init: RequestInitExt = {}): Promise<T> {
    const {skipAuth = false, withDeviceId = false, retry401 = true, headers, ...rest} = init;

    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    const normalizedHeaders = new Headers(headers);
    normalizedHeaders.forEach((value, key) => {
        requestHeaders[key] = value;
    });

    if (!skipAuth) {
        const accessToken = getAccessToken();
        if (!accessToken) {
            redirectToLogin("login-required");
            throw new AuthServiceError("로그인이 필요합니다.", 401);
        }
        requestHeaders.Authorization = `Bearer ${accessToken}`;
    }

    if (withDeviceId) {
        const deviceId = getDeviceId();
        if (deviceId) {
            requestHeaders["X-Device-Id"] = deviceId;
        }
    }

    const res = await fetch(buildUrl(path), {
        ...rest,
        headers: requestHeaders,
    });

    const text = await res.text();
    let payload: unknown = null;
    if (text) {
        try {
            payload = JSON.parse(text) as unknown;
        } catch {
            payload = text;
        }
    }

    if (res.status === 401 && !skipAuth && retry401) {
        const refreshed = await refreshTokenSilently();
        if (refreshed) {
            return await request<T>(path, {...init, retry401: false});
        }
        redirectToLogin("expired");
    }

    if (!res.ok) {
        throw new AuthServiceError(toApiErrorMessage(payload, `HTTP ${res.status}`), res.status, payload);
    }

    if (isApiResponse<T>(payload)) {
        if (payload.result !== "SUCCESS") {
            throw new AuthServiceError(toApiErrorMessage(payload, "요청 처리에 실패했습니다."), res.status, payload);
        }
        return payload.data;
    }

    return payload as T;
}

async function refreshTokenSilently(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const data = await request<unknown>("/api/v1/auth/local/token/refresh", {
            method: "POST",
            skipAuth: true,
            withDeviceId: true,
            body: JSON.stringify({refreshToken}),
        });

        const tokenPayload = parseTokenPayload(data);
        setTokens(tokenPayload);
        return true;
    } catch {
        clearSession();
        return false;
    }
}

export async function login(payload: LoginPayload, deviceId?: string): Promise<void> {
    const data = await request<unknown>("/api/v1/auth/local/login", {
        method: "POST",
        skipAuth: true,
        withDeviceId: Boolean(deviceId),
        headers: deviceId ? {"X-Device-Id": deviceId} : undefined,
        body: JSON.stringify(payload),
    });

    const tokenPayload = parseTokenPayload(data);
    setTokens(tokenPayload);
}

export async function refreshToken(): Promise<void> {
    const ok = await refreshTokenSilently();
    if (!ok) {
        throw new AuthServiceError("토큰 재발급에 실패했습니다.", 401);
    }
}

export async function logout(logoutAll: boolean): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
        await request<unknown>("/api/v1/auth/local/logout", {
            method: "POST",
            withDeviceId: true,
            body: JSON.stringify({refreshToken, logoutAll}),
        });
    } finally {
        clearSession();
    }
}

function buildQuery(params: Record<string, string | number | undefined>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === "") return;
        query.set(key, String(value));
    });
    const text = query.toString();
    return text ? `?${text}` : "";
}

export async function getLoginHistory(params: {
    page: number;
    size: number;
    sort?: string;
    startDate?: string;
    endDate?: string;
    userId?: string | number;
}): Promise<PageResponse<LoginHistoryItem>> {
    return await request<PageResponse<LoginHistoryItem>>(
        `/api/v1/auth/admin/login-history${buildQuery(params)}`,
        {method: "GET"}
    );
}

export async function getBlockedUsers(params: {page: number; size: number}): Promise<PageResponse<UserStatusItem>> {
    return await request<PageResponse<UserStatusItem>>(`/api/v1/auth/admin/users/blocked${buildQuery(params)}`, {method: "GET"});
}

export async function getDeletedUsers(params: {page: number; size: number}): Promise<PageResponse<UserStatusItem>> {
    return await request<PageResponse<UserStatusItem>>(`/api/v1/auth/admin/users/deleted${buildQuery(params)}`, {method: "GET"});
}

export async function getUsers(params: {
    page: number;
    size: number;
    keyword?: string;
    userStatus?: "ACTIVE" | "BLOCKED" | "SOFT_DELETED" | string;
    role?: "USER" | "ADMIN" | string;
    authProvider?: "LOCAL" | "GOOGLE" | "NAVER" | "KAKAO" | string;
    sort?: string;
}): Promise<PageResponse<UserListItem>> {
    return await request<PageResponse<UserListItem>>(`/api/v1/auth/admin/users${buildQuery(params)}`, {method: "GET"});
}

export async function blockUser(userId: string, reason?: string): Promise<UserStatusItem> {
    return await request<UserStatusItem>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/block`, {
        method: "POST",
        body: JSON.stringify({reason}),
    });
}

export async function unblockUser(userId: string): Promise<UserStatusItem> {
    return await request<UserStatusItem>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/unblock`, {
        method: "POST",
        body: JSON.stringify({}),
    });
}

export async function getUserStatusAudits(userId: string, params: {page: number; size: number; sort?: string}): Promise<PageResponse<UserStatusAuditItem>> {
    return await request<PageResponse<UserStatusAuditItem>>(
        `/api/v1/auth/admin/users/${encodeURIComponent(userId)}/status-audits${buildQuery(params)}`,
        {method: "GET"}
    );
}

export async function getUserDetail(userId: string): Promise<UserDetail> {
    return await request<UserDetail>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}`, {method: "GET"});
}

export async function updateUserDetail(userId: string, payload: UserUpdatePayload): Promise<UserDetail> {
    return await request<UserDetail>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function softDeleteUser(userId: string, reason: string): Promise<UserStatusItem> {
    return await request<UserStatusItem>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/delete`, {
        method: "POST",
        body: JSON.stringify({reason}),
    });
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<UserDetail> {
    return await request<UserDetail>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/password/reset`, {
        method: "POST",
        body: JSON.stringify({newPassword}),
    });
}

export async function revokeUserTokens(userId: string): Promise<UserDetail> {
    return await request<UserDetail>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/tokens/revoke`, {
        method: "POST",
        body: JSON.stringify({}),
    });
}


export async function sendSms(to: string, text: string): Promise<void> {
    await request<void>("/api/v1/auth/admin/sms/send", {
        method: "POST",
        body: JSON.stringify({to, text}),
    });
}

export async function getSmsLogs(params: {
    page: number;
    size: number;
    startDate?: string;
    endDate?: string;
}): Promise<PageResponse<SmsLogItem>> {
    return await request<PageResponse<SmsLogItem>>(`/api/v1/auth/admin/sms/logs${buildQuery(params)}`, {
        method: "GET",
    });
}

export async function getSmsStats(params: {
    startDate?: string;
    endDate?: string;
}): Promise<SmsStatsItem> {
    return await request<SmsStatsItem>(`/api/v1/auth/admin/sms/stats${buildQuery(params)}`, {
        method: "GET",
    });
}

export async function getHealth(): Promise<HealthSnapshot> {
    return await request<HealthSnapshot>("/api/v1/auth/admin/health", {method: "GET"});
}

export async function getPublicHealth(): Promise<HealthSnapshot> {
    return await request<HealthSnapshot>("/health", {method: "GET", skipAuth: true});
}

export async function getOAuthAuthorizeUrl(provider: string, returnUrl?: string): Promise<string> {
    return await request<string>(`/api/v1/auth/oauth2/${encodeURIComponent(provider)}/authorize-url${buildQuery({returnUrl})}`, {method: "GET", skipAuth: true});
}


export async function callTestApi(path: string, method: "GET" | "POST", body?: unknown): Promise<unknown> {
    return await request<unknown>(path, {
        method,
        skipAuth: false,
        withDeviceId: true,
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });
}
