import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentDeviceId, loginAdmin } from "../../../api/authApi";
import { clearSession } from "../../../api/sessionStore";
import { useAuth } from "../useAuth";

type LocationState = { from?: string; reason?: string };

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuthState } = useAuth();
  const locationState = location.state as LocationState | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(locationState?.reason ?? "");

  useEffect(() => {
    if (!locationState?.reason) return;
    clearSession();
    refreshAuthState();
  }, [locationState?.reason, refreshAuthState]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const value = email.trim();
    if (!value || !password) {
      setError("로그인 정보를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await loginAdmin({ email: value, password });
      refreshAuthState();
      const from = locationState?.from;
      navigate(from ?? "/", { replace: true });
    } catch (e) {
      // Ensure failed login never keeps a stale authenticated session.
      clearSession();
      refreshAuthState();
      setError(e instanceof Error ? `로그인 실패: ${e.message}` : "로그인 실패: 원인을 확인할 수 없습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: "560px" }}>
      <h3 className="mb-3">관리자 로그인</h3>
      <p className="text-muted">로그인/토큰 갱신/로그아웃은 동일 `X-Device-Id`를 사용합니다.</p>
      <div className="small text-muted mb-3">현재 Device ID: {getCurrentDeviceId()}</div>

      <form className="card p-4" onSubmit={onSubmit}>
        <label className="form-label">이메일</label>
        <input className="form-control mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="form-label">비밀번호</label>
        <input type="password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="d-flex justify-content-between mt-3 small">
        <Link to="/oauth2">OAuth2 인가 URL 시작</Link>
      </div>
    </main>
  );
}
