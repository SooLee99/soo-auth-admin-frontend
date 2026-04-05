import type {TokenPayload} from "../../types/auth-service";

const ACCESS_TOKEN = "auth.accessToken";
const REFRESH_TOKEN = "auth.refreshToken";
const ACCESS_EXPIRES_IN = "auth.accessExpiresInSec";
const REFRESH_EXPIRES_IN = "auth.refreshExpiresInSec";
const ACCESS_EXPIRES_AT = "auth.accessExpiresAt";
const REFRESH_EXPIRES_AT = "auth.refreshExpiresAt";
const DEVICE_ID = "auth.deviceId";

function nowSec(): number {
    return Math.floor(Date.now() / 1000);
}

export function getAccessToken(): string {
    return sessionStorage.getItem(ACCESS_TOKEN)?.trim() ?? "";
}

export function getRefreshToken(): string {
    return sessionStorage.getItem(REFRESH_TOKEN)?.trim() ?? "";
}

export function getDeviceId(): string {
    return sessionStorage.getItem(DEVICE_ID)?.trim() ?? "";
}

export function setDeviceId(deviceId: string): void {
    const value = deviceId.trim();
    if (value) {
        sessionStorage.setItem(DEVICE_ID, value);
    } else {
        sessionStorage.removeItem(DEVICE_ID);
    }
}

export function setTokens(payload: TokenPayload): void {
    sessionStorage.setItem(ACCESS_TOKEN, payload.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN, payload.refreshToken);

    if (typeof payload.accessExpiresInSec === "number") {
        const exp = nowSec() + payload.accessExpiresInSec;
        sessionStorage.setItem(ACCESS_EXPIRES_IN, String(payload.accessExpiresInSec));
        sessionStorage.setItem(ACCESS_EXPIRES_AT, String(exp));
    }

    if (typeof payload.refreshExpiresInSec === "number") {
        const exp = nowSec() + payload.refreshExpiresInSec;
        sessionStorage.setItem(REFRESH_EXPIRES_IN, String(payload.refreshExpiresInSec));
        sessionStorage.setItem(REFRESH_EXPIRES_AT, String(exp));
    }
}

export function clearSession(): void {
    sessionStorage.removeItem(ACCESS_TOKEN);
    sessionStorage.removeItem(REFRESH_TOKEN);
    sessionStorage.removeItem(ACCESS_EXPIRES_IN);
    sessionStorage.removeItem(REFRESH_EXPIRES_IN);
    sessionStorage.removeItem(ACCESS_EXPIRES_AT);
    sessionStorage.removeItem(REFRESH_EXPIRES_AT);
}

export function hasSession(): boolean {
    return Boolean(getAccessToken());
}
