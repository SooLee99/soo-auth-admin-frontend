import type { PageResponse } from "../types/api";
import type {
  HealthSnapshot,
  LoginHistoryItem,
  UserDetail,
  UserListItem,
  UserStatusAuditItem,
  UserStatusItem,
  UserUpdatePayload,
} from "../types/admin";
import { request } from "./httpClient";

function query(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    q.set(key, String(value));
  }
  const text = q.toString();
  return text ? `?${text}` : "";
}

export function getHealth(): Promise<HealthSnapshot> {
  return request<HealthSnapshot>("/api/v1/auth/admin/health", { method: "GET" });
}

export function getUsers(params: {
  page: number;
  size: number;
  keyword?: string;
  userStatus?: string;
  role?: string;
  authProvider?: string;
  sort?: string;
}): Promise<PageResponse<UserListItem>> {
  return request<PageResponse<UserListItem>>(`/api/v1/auth/admin/users${query(params)}`, { method: "GET" });
}

export function getUserDetail(userId: string): Promise<UserDetail> {
  return request<UserDetail>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}`, { method: "GET" });
}

export function updateUserDetail(userId: string, payload: UserUpdatePayload): Promise<UserDetail> {
  return request<UserDetail>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function blockUser(userId: string, reason?: string): Promise<UserStatusItem> {
  return request<UserStatusItem>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/block`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function unblockUser(userId: string): Promise<UserStatusItem> {
  return request<UserStatusItem>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/unblock`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getBlockedUsers(params: { page: number; size: number }): Promise<PageResponse<UserStatusItem>> {
  return request<PageResponse<UserStatusItem>>(`/api/v1/auth/admin/users/blocked${query(params)}`, { method: "GET" });
}

export function getDeletedUsers(params: { page: number; size: number }): Promise<PageResponse<UserStatusItem>> {
  return request<PageResponse<UserStatusItem>>(`/api/v1/auth/admin/users/deleted${query(params)}`, { method: "GET" });
}

export function getLoginHistory(params: {
  page: number;
  size: number;
  sort?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}): Promise<PageResponse<LoginHistoryItem>> {
  return request<PageResponse<LoginHistoryItem>>(`/api/v1/auth/admin/login-history${query(params)}`, { method: "GET" });
}

export function getUserStatusAudits(userId: string, params: { page: number; size: number; sort?: string }): Promise<PageResponse<UserStatusAuditItem>> {
  return request<PageResponse<UserStatusAuditItem>>(
    `/api/v1/auth/admin/users/${encodeURIComponent(userId)}/status-audits${query(params)}`,
    { method: "GET" }
  );
}

export function resetUserPassword(userId: string, newPassword: string): Promise<UserDetail> {
  return request<UserDetail>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/password/reset`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

export function revokeUserTokens(userId: string): Promise<UserDetail> {
  return request<UserDetail>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/tokens/revoke`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function softDeleteUser(userId: string, reason: string): Promise<UserStatusItem> {
  return request<UserStatusItem>(`/api/v1/auth/admin/users/${encodeURIComponent(userId)}/delete`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
