import { FormEvent, useCallback, useEffect, useReducer, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  blockUser,
  getUserDetail,
  resetUserPassword,
  revokeUserTokens,
  softDeleteUser,
  unblockUser,
  updateUserDetail,
} from "../../../api/adminApi";
import PageFrame from "../../../components/common/PageFrame";
import type { UserDetail, UserUpdatePayload } from "../../../types/admin";
import { formatDateTime } from "../../../utils/format";
import { useAdminShell } from "../useAdminShell";

type FormState = {
  email: string;
  phoneNumber: string;
  name: string;
  nickname: string;
  role: "USER" | "ADMIN";
  userStatus: "ACTIVE" | "BLOCKED";
  blockedReason: string;
};

type FormAction =
  | { type: "set"; payload: FormState }
  | { type: "patch"; payload: Partial<FormState> };

function reducer(state: FormState, action: FormAction): FormState {
  if (action.type === "set") return action.payload;
  return { ...state, ...action.payload };
}

function toFormState(user: UserDetail): FormState {
  return {
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    name: user.name ?? "",
    nickname: user.nickname ?? "",
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
    userStatus: user.userStatus === "BLOCKED" ? "BLOCKED" : "ACTIVE",
    blockedReason: user.blockedReason ?? "",
  };
}

function toPayload(form: FormState): UserUpdatePayload {
  return {
    email: form.email || undefined,
    phoneNumber: form.phoneNumber || undefined,
    name: form.name || undefined,
    nickname: form.nickname || undefined,
    role: form.role,
    userStatus: form.userStatus,
    blockedReason: form.blockedReason || undefined,
  };
}

const EMPTY_FORM: FormState = {
  email: "",
  phoneNumber: "",
  name: "",
  nickname: "",
  role: "USER",
  userStatus: "ACTIVE",
  blockedReason: "",
};

export default function UserDetailPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const navigate = useNavigate();
  const { userId = "" } = useParams();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [form, dispatch] = useReducer(reducer, EMPTY_FORM);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (): Promise<void> => {
    setError("");
    try {
      const detail = await getUserDetail(userId);
      setUser(detail);
      dispatch({ type: "set", payload: toFormState(detail) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "상세 조회 실패");
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void load();
  }, [load, userId]);

  async function onSave(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!userId) return;
    setError("");
    setNotice("");
    try {
      const updated = await updateUserDetail(userId, toPayload(form));
      setUser(updated);
      dispatch({ type: "set", payload: toFormState(updated) });
      setEditMode(false);
      setNotice("사용자 정보가 저장되었습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    }
  }

  async function onBlock(): Promise<void> {
    if (!userId) return;
    const reason = window.prompt("차단 사유", form.blockedReason) ?? "";
    try {
      await blockUser(userId, reason || undefined);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "차단 실패");
    }
  }

  async function onUnblock(): Promise<void> {
    if (!userId) return;
    try {
      await unblockUser(userId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "차단 해제 실패");
    }
  }

  async function onSoftDelete(): Promise<void> {
    if (!userId) return;
    const reason = window.prompt("삭제 사유", "") ?? "";
    if (!reason.trim()) {
      setError("삭제 사유가 필요합니다.");
      return;
    }
    try {
      await softDeleteUser(userId, reason.trim());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "소프트 삭제 실패");
    }
  }

  async function onResetPassword(): Promise<void> {
    if (!userId) return;
    const password = window.prompt("새 비밀번호", "") ?? "";
    if (!password.trim()) return;
    try {
      const updated = await resetUserPassword(userId, password.trim());
      setUser(updated);
      dispatch({ type: "set", payload: toFormState(updated) });
      setNotice("비밀번호 재설정 완료");
    } catch (e) {
      setError(e instanceof Error ? e.message : "비밀번호 재설정 실패");
    }
  }

  async function onRevokeTokens(): Promise<void> {
    if (!userId) return;
    try {
      const updated = await revokeUserTokens(userId);
      setUser(updated);
      dispatch({ type: "set", payload: toFormState(updated) });
      setNotice("사용자 토큰 강제 만료 완료");
    } catch (e) {
      setError(e instanceof Error ? e.message : "토큰 만료 실패");
    }
  }

  return (
    <PageFrame
      title={`사용자 상세: ${userId || "-"}`}
      onToggleSidebar={toggleSidebar}
      actions={
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode((prev) => !prev)}>{editMode ? "편집 취소" : "편집"}</button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => void onBlock()}>차단</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => void onUnblock()}>차단 해제</button>
          <button className="btn btn-danger btn-sm" onClick={() => void onSoftDelete()}>소프트 삭제</button>
          <button className="btn btn-outline-warning btn-sm" onClick={() => void onResetPassword()}>비밀번호 재설정</button>
          <button className="btn btn-outline-dark btn-sm" onClick={() => void onRevokeTokens()}>토큰 강제 만료</button>
          <Link className="btn btn-outline-secondary btn-sm" to={`/users/${encodeURIComponent(userId)}/status-audits`}>상태 이력</Link>
          <Link className="btn btn-outline-secondary btn-sm" to={`/users/${encodeURIComponent(userId)}/login-history`}>로그인 이력</Link>
        </div>
      }
    >
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {notice && <div className="alert alert-success py-2">{notice}</div>}
      {!user && <div className="text-muted">데이터를 불러오는 중입니다.</div>}

      {user && (
        <form className="row g-3" onSubmit={onSave}>
          <div className="col-12 col-xl-6">
            <div className="card p-3 h-100">
              <label className="form-label">email</label>
              <input className="form-control" disabled={!editMode} value={form.email} onChange={(e) => dispatch({ type: "patch", payload: { email: e.target.value } })} />

              <label className="form-label mt-2">phoneNumber</label>
              <input className="form-control" disabled={!editMode} value={form.phoneNumber} onChange={(e) => dispatch({ type: "patch", payload: { phoneNumber: e.target.value } })} />

              <label className="form-label mt-2">name</label>
              <input className="form-control" disabled={!editMode} value={form.name} onChange={(e) => dispatch({ type: "patch", payload: { name: e.target.value } })} />

              <label className="form-label mt-2">nickname</label>
              <input className="form-control" disabled={!editMode} value={form.nickname} onChange={(e) => dispatch({ type: "patch", payload: { nickname: e.target.value } })} />

              <label className="form-label mt-2">role</label>
              <select className="form-select" disabled={!editMode} value={form.role} onChange={(e) => dispatch({ type: "patch", payload: { role: e.target.value as "USER" | "ADMIN" } })}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <label className="form-label mt-2">userStatus</label>
              <select className="form-select" disabled={!editMode} value={form.userStatus} onChange={(e) => dispatch({ type: "patch", payload: { userStatus: e.target.value as "ACTIVE" | "BLOCKED" } })}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>

              <label className="form-label mt-2">blockedReason</label>
              <input className="form-control" disabled={!editMode} value={form.blockedReason} onChange={(e) => dispatch({ type: "patch", payload: { blockedReason: e.target.value } })} />

              {editMode && <button className="btn btn-primary mt-3" type="submit">저장</button>}
            </div>
          </div>

          <div className="col-12 col-xl-6">
            <div className="card p-3 h-100">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr><th>userId</th><td>{user.userId}</td></tr>
                  <tr><th>authProvider</th><td>{user.authProvider ?? "-"}</td></tr>
                  <tr><th>blockedAt</th><td>{formatDateTime(user.blockedAt)}</td></tr>
                  <tr><th>unblockedAt</th><td>{formatDateTime(user.unblockedAt)}</td></tr>
                  <tr><th>deletedAt</th><td>{formatDateTime(user.deletedAt)}</td></tr>
                  <tr><th>retentionUntil</th><td>{formatDateTime(user.retentionUntil)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-12">
            <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/users")}>목록으로</button>
          </div>
        </form>
      )}
    </PageFrame>
  );
}
