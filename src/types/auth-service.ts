export type ApiResponse<T> = {
    result: "SUCCESS" | "ERROR";
    meta?: {
        timestamp?: string;
        request?: {
            path?: string;
            method?: string;
            query?: string | null;
        };
        requestId?: string;
        durationMs?: number;
        locale?: string;
        paging?: unknown;
    };
    data: T;
    error?: unknown | null;
};

export type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    pageable?: unknown;
    sort?: unknown;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type TokenPayload = {
    accessToken: string;
    refreshToken: string;
    accessExpiresInSec?: number;
    refreshExpiresInSec?: number;
};

export type LoginHistoryItem = {
    id: number;
    userId?: number | string;
    userEmail?: string;
    loginType?: string;
    status?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    failureReason?: string;
    createdAt?: string;
};

export type UserStatusItem = {
    userId: number | string;
    userStatus?: string;
    blocked?: boolean;
    blockedReason?: string;
    blockedAt?: string;
    blockedByAdminId?: number | string;
    unblockedAt?: string;
    unblockedByAdminId?: number | string;
    deletedAt?: string;
    deletionReason?: string;
    retentionUntil?: string;
};

export type UserListItem = {
    userId: number | string;
    email?: string;
    name?: string;
    nickname?: string;
    role?: "USER" | "ADMIN" | string;
    authProvider?: "LOCAL" | "GOOGLE" | "NAVER" | "KAKAO" | string;
    userStatus?: "ACTIVE" | "BLOCKED" | "SOFT_DELETED" | string;
    blocked?: boolean;
    deletedAt?: string;
};

export type UserDetail = {
    userId: number | string;
    email?: string;
    emailVerified?: boolean;
    phoneNumber?: string;
    phoneVerified?: boolean;
    name?: string;
    nickname?: string;
    gender?: string;
    locale?: string;
    birthyear?: string;
    birthday?: string;
    profileImageUrl?: string;
    thumbnailImageUrl?: string;
    authProvider?: string;
    oauthProviderUserId?: string;
    role?: "USER" | "ADMIN" | string;
    userStatus?: "ACTIVE" | "BLOCKED" | "SOFT_DELETED" | string;
    blocked?: boolean;
    blockedReason?: string;
    blockedAt?: string;
    blockedByAdminId?: number | string;
    unblockedAt?: string;
    unblockedByAdminId?: number | string;
    deletedAt?: string;
    deletionReason?: string;
    retentionUntil?: string;
};

export type UserUpdatePayload = {
    email?: string;
    phoneNumber?: string;
    name?: string;
    nickname?: string;
    gender?: string;
    locale?: string;
    birthyear?: string;
    birthday?: string;
    profileImageUrl?: string;
    thumbnailImageUrl?: string;
    role?: "USER" | "ADMIN";
    userStatus?: "ACTIVE" | "BLOCKED";
    blocked?: boolean;
    blockedReason?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
};

export type UserStatusAuditItem = {
    id: number;
    targetUserId: number | string;
    actorUserId?: number | string;
    actionType?: "BLOCK" | "UNBLOCK" | "SOFT_DELETE" | string;
    reason?: string;
    actionAt?: string;
};


export type HealthComponent = {
    status?: string;
    latencyMs?: number;
};

export type HealthSnapshot = {
    status?: "UP" | "DOWN" | string;
    application?: string;
    profiles?: string[];
    uptimeSec?: number;
    components?: {
        database?: HealthComponent;
        redis?: HealthComponent;
        [key: string]: HealthComponent | undefined;
    };
    system?: {
        jvm?: {
            heapUsedBytes?: number;
            heapMaxBytes?: number;
            processors?: number;
        };
        disk?: {
            totalBytes?: number;
            usableBytes?: number;
        };
    };
    links?: {
        docs?: {
            swagger?: string;
            docs?: string;
        };
        monitoring?: {
            grafana?: string;
            prometheus?: string;
            loki?: string;
        };
        logs?: {
            lokiQuery?: string;
            grafanaExplore?: string;
        };
    };
};

export type SmsLogItem = {
    id: number;
    to: string;
    from?: string;
    text: string;
    ok?: boolean;
    provider?: string;
    code?: string;
    msg?: string;
    at: string;
};

export type SmsStatsItem = {
    total: number;
    ok: number;
    fail: number;
    rate: number;
};
