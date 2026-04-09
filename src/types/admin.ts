export type UserRole = "USER" | "ADMIN" | string;
export type UserStatus = "ACTIVE" | "BLOCKED" | "SOFT_DELETED" | string;

export type UserListItem = {
  userId: number | string;
  email?: string;
  name?: string;
  nickname?: string;
  role?: UserRole;
  authProvider?: string;
  userStatus?: UserStatus;
  blocked?: boolean;
  deletedAt?: string;
};

export type UserStatusItem = {
  userId: number | string;
  userStatus?: UserStatus;
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
  role?: UserRole;
  userStatus?: UserStatus;
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
  role?: "USER" | "ADMIN";
  userStatus?: "ACTIVE" | "BLOCKED";
  blocked?: boolean;
  blockedReason?: string;
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

export type UserStatusAuditItem = {
  id: number;
  targetUserId: number | string;
  actorUserId?: number | string;
  actionType?: string;
  reason?: string;
  actionAt?: string;
};

export type HealthComponent = { status?: string; latencyMs?: number };

export type HealthSnapshot = {
  status?: "UP" | "DOWN" | string;
  application?: string;
  profiles?: string[];
  uptimeSec?: number;
  components?: Record<string, HealthComponent | undefined>;
  system?: {
    jvm?: { heapUsedBytes?: number; heapMaxBytes?: number; processors?: number };
    disk?: { totalBytes?: number; usableBytes?: number };
  };
  links?: Record<string, Record<string, string> | undefined>;
};
