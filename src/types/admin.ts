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

export type HealthComponent = {
  status?: string;
  latencyMs?: number;
  [key: string]: unknown;
};

export type HealthMonitoringTarget = {
  status?: string;
  latencyMs?: number;
  httpStatus?: number;
  url?: string;
  error?: string;
  [key: string]: unknown;
};

export type HealthMonitoringComponent = HealthComponent & {
  targets?: Record<string, HealthMonitoringTarget | undefined>;
};

export type HealthDatabasePool = {
  activeConnections?: number;
  idleConnections?: number;
  threadsAwaitingConnection?: number;
  totalConnections?: number;
};

export type HealthDatabaseComponent = HealthComponent & {
  product?: string;
  version?: string;
  driver?: string;
  url?: string;
  pool?: HealthDatabasePool;
};

export type HealthSystemJvm = {
  heapUsedBytes?: number;
  heapMaxBytes?: number;
  processors?: number;
};

export type HealthSystemDisk = {
  totalBytes?: number;
  usableBytes?: number;
};

export type HealthSnapshot = {
  status?: "UP" | "DOWN" | string;
  application?: string;
  version?: string;
  startedAt?: string;
  profiles?: string[];
  uptimeSec?: number;
  build?: {
    version?: string;
    buildTime?: string | null;
    gitCommitId?: string | null;
    gitBranch?: string | null;
  };
  components?: {
    database?: HealthDatabaseComponent;
    redis?: HealthComponent;
    monitoring?: HealthMonitoringComponent;
    [key: string]: HealthComponent | HealthMonitoringComponent | HealthDatabaseComponent | undefined;
  };
  system?: {
    jvm?: HealthSystemJvm;
    disk?: HealthSystemDisk;
  };
  links?: Record<string, Record<string, string> | undefined>;
};
