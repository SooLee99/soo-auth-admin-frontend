import {FormEvent, useEffect, useState} from "react";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import AdminPage from "../../components/admin/AdminPage";
import {frontBaseUrl} from "../../build_constants";
import {
    blockUser,
    getUserDetail,
    resetUserPassword,
    revokeUserTokens,
    softDeleteUser,
    unblockUser,
    updateUserDetail,
} from "../../lib/auth-service/client";
import type {UserDetail, UserUpdatePayload} from "../../types/auth-service";
import {fmtDateTime} from "../../utils/format";

type Props = {
    toggleSidebar?: () => void;
};

type FormState = {
    email: string;
    emailVerified: boolean;
    phoneNumber: string;
    phoneVerified: boolean;
    name: string;
    nickname: string;
    gender: string;
    locale: string;
    birthyear: string;
    birthday: string;
    profileImageUrl: string;
    thumbnailImageUrl: string;
    role: "USER" | "ADMIN";
    userStatus: "ACTIVE" | "BLOCKED";
    blocked: boolean;
    blockedReason: string;
};

function toFormState(user: UserDetail): FormState {
    return {
        email: user.email ?? "",
        emailVerified: Boolean(user.emailVerified),
        phoneNumber: user.phoneNumber ?? "",
        phoneVerified: Boolean(user.phoneVerified),
        name: user.name ?? "",
        nickname: user.nickname ?? "",
        gender: user.gender ?? "",
        locale: user.locale ?? "",
        birthyear: user.birthyear ?? "",
        birthday: user.birthday ?? "",
        profileImageUrl: user.profileImageUrl ?? "",
        thumbnailImageUrl: user.thumbnailImageUrl ?? "",
        role: user.role === "ADMIN" ? "ADMIN" : "USER",
        userStatus: user.userStatus === "BLOCKED" ? "BLOCKED" : "ACTIVE",
        blocked: Boolean(user.blocked),
        blockedReason: user.blockedReason ?? "",
    };
}

function toPayload(form: FormState): UserUpdatePayload {
    return {
        email: form.email || undefined,
        emailVerified: form.emailVerified,
        phoneNumber: form.phoneNumber || undefined,
        phoneVerified: form.phoneVerified,
        name: form.name || undefined,
        nickname: form.nickname || undefined,
        gender: form.gender || undefined,
        locale: form.locale || undefined,
        birthyear: form.birthyear || undefined,
        birthday: form.birthday || undefined,
        profileImageUrl: form.profileImageUrl || undefined,
        thumbnailImageUrl: form.thumbnailImageUrl || undefined,
        role: form.role,
        userStatus: form.userStatus,
        blocked: form.blocked,
        blockedReason: form.blockedReason || undefined,
    };
}

function renderValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

export default function UserDetailPage({toggleSidebar}: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{userId: string}>();
    const userId = (params.userId ?? "").trim();

    const [user, setUser] = useState<UserDetail | null>(null);
    const [form, setForm] = useState<FormState | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [securityWorking, setSecurityWorking] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        setEditMode(location.pathname.endsWith("/edit"));
    }, [location.pathname]);

    useEffect(() => {
        if (!userId) return;
        void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    async function loadDetail() {
        if (!userId) return;
        setLoading(true);
        setError("");
        setNotice("");
        try {
            const detail = await getUserDetail(userId);
            setUser(detail);
            setForm(toFormState(detail));
        } catch (e) {
            setError(e instanceof Error ? e.message : "사용자 상세 조회에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }

    async function onSave(e: FormEvent) {
        e.preventDefault();
        if (!form || !userId) return;

        setSaving(true);
        setError("");
        setNotice("");
        try {
            const updated = await updateUserDetail(userId, toPayload(form));
            setUser(updated);
            setForm(toFormState(updated));
            setEditMode(false);
            navigate(`${frontBaseUrl}/users/${encodeURIComponent(userId)}`, {replace: true});
        } catch (e) {
            setError(e instanceof Error ? e.message : "사용자 수정에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    }

    async function onBlock() {
        if (!userId) return;
        const reason = window.prompt("차단 사유를 입력해 주세요.", user?.blockedReason ?? "") ?? "";
        try {
            setNotice("");
            await blockUser(userId, reason || undefined);
            await loadDetail();
        } catch (e) {
            setError(e instanceof Error ? e.message : "차단 처리에 실패했습니다.");
        }
    }

    async function onUnblock() {
        if (!userId) return;
        if (!window.confirm("차단을 해제하시겠습니까?")) return;
        try {
            setNotice("");
            await unblockUser(userId);
            await loadDetail();
        } catch (e) {
            setError(e instanceof Error ? e.message : "차단 해제에 실패했습니다.");
        }
    }

    async function onSoftDelete() {
        if (!userId) return;
        const reason = window.prompt("소프트 삭제 사유를 입력해 주세요.", "") ?? "";
        if (!reason.trim()) {
            setError("삭제 사유는 필수입니다.");
            return;
        }
        if (!window.confirm("사용자를 소프트 삭제하시겠습니까?")) return;

        try {
            setNotice("");
            await softDeleteUser(userId, reason.trim());
            await loadDetail();
        } catch (e) {
            setError(e instanceof Error ? e.message : "소프트 삭제에 실패했습니다.");
        }
    }

    async function onResetPassword() {
        if (!userId) return;
        const newPassword = window.prompt("새 비밀번호를 입력해 주세요.", "") ?? "";
        if (!newPassword.trim()) {
            setError("새 비밀번호는 필수입니다.");
            return;
        }
        const confirmPassword = window.prompt("새 비밀번호를 다시 입력해 주세요.", "") ?? "";
        if (newPassword !== confirmPassword) {
            setError("비밀번호 확인 값이 일치하지 않습니다.");
            return;
        }
        if (!window.confirm("비밀번호 재설정 시 기존 세션/토큰이 무효화될 수 있습니다. 진행하시겠습니까?")) return;

        setSecurityWorking(true);
        setError("");
        setNotice("");
        try {
            const updated = await resetUserPassword(userId, newPassword);
            setUser(updated);
            setForm(toFormState(updated));
            setNotice("비밀번호 재설정이 완료되었습니다. 기존 세션/토큰이 무효화됩니다.");
        } catch (e) {
            setError(e instanceof Error ? e.message : "비밀번호 재설정에 실패했습니다.");
        } finally {
            setSecurityWorking(false);
        }
    }

    async function onRevokeTokens() {
        if (!userId) return;
        if (!window.confirm("이 사용자의 모든 로그인 세션을 종료하시겠습니까?")) return;

        setSecurityWorking(true);
        setError("");
        setNotice("");
        try {
            const updated = await revokeUserTokens(userId);
            setUser(updated);
            setForm(toFormState(updated));
            setNotice("모든 로그인 세션/토큰이 강제 만료되었습니다.");
        } catch (e) {
            setError(e instanceof Error ? e.message : "토큰 강제 만료 처리에 실패했습니다.");
        } finally {
            setSecurityWorking(false);
        }
    }

    const actionButtons = (
        <div className="d-flex gap-2 flex-wrap">
            {!editMode && (
                <button className="btn btn-primary btn-sm" type="button" onClick={() => {
                    setEditMode(true);
                    navigate(`${frontBaseUrl}/users/${encodeURIComponent(userId)}/edit`);
                }}>
                    수정
                </button>
            )}
            {editMode && (
                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => {
                    setEditMode(false);
                    if (user) setForm(toFormState(user));
                    navigate(`${frontBaseUrl}/users/${encodeURIComponent(userId)}`);
                }}>
                    편집 취소
                </button>
            )}
            <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => void onBlock()}>
                차단
            </button>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => void onUnblock()}>
                차단 해제
            </button>
            <button className="btn btn-danger btn-sm" type="button" onClick={() => void onSoftDelete()}>
                소프트 삭제
            </button>
            <button className="btn btn-outline-warning btn-sm" type="button" disabled={securityWorking}
                    onClick={() => void onResetPassword()}>
                비밀번호 재설정
            </button>
            <button className="btn btn-outline-dark btn-sm" type="button" disabled={securityWorking}
                    onClick={() => void onRevokeTokens()}>
                세션 종료
            </button>
            <Link className="btn btn-outline-secondary btn-sm" to={`${frontBaseUrl}/users/${encodeURIComponent(userId)}/status-audits`}>
                상태 변경 이력
            </Link>
            <Link className="btn btn-outline-secondary btn-sm" to={`${frontBaseUrl}/users/${encodeURIComponent(userId)}/login-history`}>
                로그인 이력
            </Link>
        </div>
    );

    return (
        <AdminPage title={`사용자 상세: ${userId || "-"}`} toggleSidebar={toggleSidebar} actions={actionButtons}>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {notice && <div className="alert alert-success py-2">{notice}</div>}
            {loading && <div className="text-muted">로딩 중...</div>}

            {!loading && user && form && (
                <form className="row g-3" onSubmit={onSave}>
                    <div className="col-12 col-xl-4">
                        <div className="card p-3 h-100">
                            <h6>기본 정보</h6>
                            <div className="small text-muted mb-2">사용자 ID: {renderValue(user.userId)}</div>

                            <label className="form-label mt-2">이메일</label>
                            <input className="form-control" disabled={!editMode} value={form.email}
                                   onChange={(e) => setForm({...form, email: e.target.value})}/>

                            <div className="form-check mt-2">
                                <input id="emailVerified" className="form-check-input" type="checkbox" disabled={!editMode} checked={form.emailVerified}
                                       onChange={(e) => setForm({...form, emailVerified: e.target.checked})}/>
                                <label htmlFor="emailVerified" className="form-check-label">이메일 인증됨</label>
                            </div>

                            <label className="form-label mt-2">전화번호</label>
                            <input className="form-control" disabled={!editMode} value={form.phoneNumber}
                                   onChange={(e) => setForm({...form, phoneNumber: e.target.value})}/>

                            <div className="form-check mt-2">
                                <input id="phoneVerified" className="form-check-input" type="checkbox" disabled={!editMode} checked={form.phoneVerified}
                                       onChange={(e) => setForm({...form, phoneVerified: e.target.checked})}/>
                                <label htmlFor="phoneVerified" className="form-check-label">전화번호 인증됨</label>
                            </div>

                            <label className="form-label mt-2">이름</label>
                            <input className="form-control" disabled={!editMode} value={form.name}
                                   onChange={(e) => setForm({...form, name: e.target.value})}/>

                            <label className="form-label mt-2">닉네임</label>
                            <input className="form-control" disabled={!editMode} value={form.nickname}
                                   onChange={(e) => setForm({...form, nickname: e.target.value})}/>

                            <label className="form-label mt-2">성별</label>
                            <input className="form-control" disabled={!editMode} value={form.gender}
                                   onChange={(e) => setForm({...form, gender: e.target.value})}/>

                            <label className="form-label mt-2">로케일</label>
                            <input className="form-control" disabled={!editMode} value={form.locale}
                                   onChange={(e) => setForm({...form, locale: e.target.value})}/>

                            <label className="form-label mt-2">출생연도</label>
                            <input className="form-control" disabled={!editMode} value={form.birthyear}
                                   onChange={(e) => setForm({...form, birthyear: e.target.value})}/>

                            <label className="form-label mt-2">생일</label>
                            <input className="form-control" disabled={!editMode} value={form.birthday}
                                   onChange={(e) => setForm({...form, birthday: e.target.value})}/>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="card p-3 h-100">
                            <h6>인증 / 이미지 정보</h6>
                            <div className="small text-muted">인증 제공자: {renderValue(user.authProvider)}</div>
                            <div className="small text-muted mb-2">OAuth 제공자 사용자 ID: {renderValue(user.oauthProviderUserId)}</div>

                            <label className="form-label">프로필 이미지 URL</label>
                            <input className="form-control" disabled={!editMode} value={form.profileImageUrl}
                                   onChange={(e) => setForm({...form, profileImageUrl: e.target.value})}/>

                            <label className="form-label mt-2">썸네일 이미지 URL</label>
                            <input className="form-control" disabled={!editMode} value={form.thumbnailImageUrl}
                                   onChange={(e) => setForm({...form, thumbnailImageUrl: e.target.value})}/>

                            <div className="mt-3">
                                <label className="form-label">역할</label>
                                <select className="form-select" disabled={!editMode} value={form.role}
                                        onChange={(e) => setForm({...form, role: e.target.value as "USER" | "ADMIN"})}>
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="mt-3">
                                <label className="form-label">사용자 상태</label>
                                <select className="form-select" disabled={!editMode} value={form.userStatus}
                                        onChange={(e) => setForm({...form, userStatus: e.target.value as "ACTIVE" | "BLOCKED"})}>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="BLOCKED">BLOCKED</option>
                                </select>
                            </div>

                            <div className="form-check mt-3">
                                <input id="blocked" className="form-check-input" type="checkbox" disabled={!editMode} checked={form.blocked}
                                       onChange={(e) => setForm({...form, blocked: e.target.checked})}/>
                                <label htmlFor="blocked" className="form-check-label">차단 여부</label>
                            </div>

                            <label className="form-label mt-2">차단 사유</label>
                            <input className="form-control" disabled={!editMode} value={form.blockedReason}
                                   onChange={(e) => setForm({...form, blockedReason: e.target.value})}/>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="card p-3 h-100">
                            <h6>상태 정보 (읽기 전용)</h6>
                            <table className="table table-sm mb-0">
                                <tbody>
                                <tr><th>사용자 상태</th><td>{renderValue(user.userStatus)}</td></tr>
                                <tr><th>차단 여부</th><td>{String(Boolean(user.blocked))}</td></tr>
                                <tr><th>차단 일시</th><td>{fmtDateTime(user.blockedAt)}</td></tr>
                                <tr><th>차단한 관리자 ID</th><td>{renderValue(user.blockedByAdminId)}</td></tr>
                                <tr><th>차단 해제 일시</th><td>{fmtDateTime(user.unblockedAt)}</td></tr>
                                <tr><th>차단 해제한 관리자 ID</th><td>{renderValue(user.unblockedByAdminId)}</td></tr>
                                <tr><th>삭제 일시</th><td>{fmtDateTime(user.deletedAt)}</td></tr>
                                <tr><th>삭제 사유</th><td>{renderValue(user.deletionReason)}</td></tr>
                                <tr><th>데이터 보유 기한</th><td>{fmtDateTime(user.retentionUntil)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {editMode && (
                        <div className="col-12">
                            <button className="btn btn-primary" type="submit" disabled={saving}>
                                {saving ? "저장 중..." : "사용자 정보 저장"}
                            </button>
                        </div>
                    )}
                </form>
            )}
        </AdminPage>
    );
}
