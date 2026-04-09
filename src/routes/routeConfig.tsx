import { Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import RequireAuth from "../features/auth/RequireAuth";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import OAuthStartPage from "../features/auth/pages/OAuthStartPage";
import DashboardPage from "../features/admin/pages/DashboardPage";
import HealthPage from "../features/admin/pages/HealthPage";
import UsersPage from "../features/admin/pages/UsersPage";
import UserDetailPage from "../features/admin/pages/UserDetailPage";
import BlockedUsersPage from "../features/admin/pages/BlockedUsersPage";
import DeletedUsersPage from "../features/admin/pages/DeletedUsersPage";
import LoginHistoryPage from "../features/admin/pages/LoginHistoryPage";
import UserStatusAuditsPage from "../features/admin/pages/UserStatusAuditsPage";
import UserLoginHistoryPage from "../features/admin/pages/UserLoginHistoryPage";
import UnsupportedPage from "../features/admin/pages/UnsupportedPage";
import type { AppRouteObject, SidebarItem } from "./types";

export const appRoutes: AppRouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
    handle: { standalone: true },
    meta: { standalone: true },
  },
  {
    path: "/signup",
    element: <SignupPage />,
    handle: { standalone: true },
    meta: { standalone: true },
  },
  {
    path: "/oauth2",
    element: <OAuthStartPage />,
    handle: { standalone: true },
    meta: { standalone: true },
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage />, meta: { title: "대시보드", sidebar: true } },
          { path: "/health", element: <HealthPage />, meta: { title: "헬스", sidebar: true } },
          { path: "/login-history", element: <LoginHistoryPage />, meta: { title: "로그인 이력", sidebar: true } },
          { path: "/users", element: <UsersPage />, meta: { title: "사용자 목록", sidebar: true } },
          { path: "/users/blocked", element: <BlockedUsersPage />, meta: { title: "차단 사용자", sidebar: true } },
          { path: "/users/deleted", element: <DeletedUsersPage />, meta: { title: "탈퇴 사용자", sidebar: true } },
          { path: "/users/:userId", element: <UserDetailPage />, meta: { title: "사용자 상세", sidebar: false } },
          { path: "/users/:userId/status-audits", element: <UserStatusAuditsPage />, meta: { title: "상태 이력", sidebar: false } },
          { path: "/users/:userId/login-history", element: <UserLoginHistoryPage />, meta: { title: "사용자 로그인 이력", sidebar: false } },
          {
            path: "/unsupported",
            element: <UnsupportedPage title="미지원 API" reason="현재 서버 문서 기준으로 해당 기능 API가 확인되지 않아 화면만 유지하지 않았습니다." />,
            meta: { title: "미지원", sidebar: false },
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

export const sidebarItems: SidebarItem[] = [
  { key: "dashboard", label: "대시보드", path: "/" },
  { key: "health", label: "헬스", path: "/health" },
  { key: "login-history", label: "로그인 이력", path: "/login-history" },
  {
    key: "users",
    label: "사용자 관리",
    children: [
      { key: "users-all", label: "전체 사용자", path: "/users" },
      { key: "users-blocked", label: "차단 사용자", path: "/users/blocked" },
      { key: "users-deleted", label: "탈퇴 사용자", path: "/users/deleted" },
    ],
  },
];
