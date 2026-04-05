import {type ReactNode, useCallback, useMemo, useState} from "react";
import {Navigate, Outlet, useLocation, useMatches} from "react-router-dom";
import {defaultAuthRequire, loginPageUrl} from "../build_constants";
import AuthContext, {type AuthWrapperContextProps} from "./AuthContext";
import type {AdminInfoData} from "../lib/ModelTypes";
import {clearSession, getAccessToken, hasSession} from "../lib/auth-service/session";

const EMPTY_USER: AdminInfoData = {
    id: "",
    signed: "",
    is_superuser: false,
    group: "",
};

type JwtPayload = {
    sub?: string;
    email?: string;
    roles?: string[];
    authorities?: string[];
};

function parseJwtPayload(token: string): JwtPayload | null {
    const chunks = token.split(".");
    if (chunks.length < 2) return null;

    try {
        const json = atob(chunks[1].replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
}

function hasAdminRole(token: string): boolean {
    const payload = parseJwtPayload(token);
    if (!payload) return true;

    const roles = [...(payload.roles ?? []), ...(payload.authorities ?? [])].map((v) => v.toUpperCase());
    if (roles.length === 0) return true;
    return roles.includes("ROLE_ADMIN");
}

function getUserFromToken(): AdminInfoData {
    const token = getAccessToken();
    const payload = parseJwtPayload(token);

    return {
        id: payload?.sub ?? "",
        signed: payload?.email ?? "admin",
        is_superuser: hasAdminRole(token),
        group: "ROLE_ADMIN",
    };
}

export default function AuthWrapper(): ReactNode {
    const matches = useMatches();
    const location = useLocation();

    const authRequire =
        [...matches]
            .reverse()
            .map((m) => (m.handle as { authRequire?: boolean } | undefined)?.authRequire)
            .find((v) => v !== undefined) ?? defaultAuthRequire;

    const [userInfo, setUserInfo] = useState<AdminInfoData>(getUserFromToken());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasSession());

    const invalidate = useCallback(async () => {
        const accessToken = getAccessToken();
        if (!accessToken || !hasAdminRole(accessToken)) {
            clearSession();
            setIsAuthenticated(false);
            setUserInfo({...EMPTY_USER});
            return;
        }

        setIsAuthenticated(true);
        setUserInfo(getUserFromToken());
    }, []);

    const contextValue: AuthWrapperContextProps = useMemo(
        () => ({
            isAuthenticated,
            userInfo,
            invalidate,
        }),
        [invalidate, isAuthenticated, userInfo]
    );

    if (!authRequire) {
        return (
            <AuthContext.Provider value={contextValue}>
                <Outlet/>
            </AuthContext.Provider>
        );
    }

    const accessToken = getAccessToken();
    const allowed = Boolean(accessToken) && hasAdminRole(accessToken);

    if (!allowed) {
        const reason = accessToken ? "forbidden" : "login-required";
        clearSession();
        return (
            <Navigate
                to={loginPageUrl}
                replace
                state={{
                    from: {pathname: location.pathname, search: location.search, hash: location.hash},
                    authError: reason,
                }}
            />
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            <Outlet/>
        </AuthContext.Provider>
    );
}
