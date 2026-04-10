import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginByEmail, loginById, loginByPhone, getCurrentDeviceId } from "../../../api/authApi";
import { clearSession } from "../../../api/sessionStore";
import type { LoginMethod } from "../../../types/auth";
import { useAuth } from "../useAuth";

type LocationState = { from?: string };

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuthState } = useAuth();

  const [method, setMethod] = useState<LoginMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const idLabel = useMemo(() => {
    if (method === "email") return "이메일";
    if (method === "id") return "아이디";
    return "휴대폰";
  }, [method]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const value = identifier.trim();
    if (!value || !password) {
      setError("로그인 정보를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (method === "email") {
        await loginByEmail({ email: value, password });
      } else if (method === "id") {
        await loginById({ loginId: value, password });
      } else {
        await loginByPhone({ phoneNumber: value, password });
      }

      refreshAuthState();
      const from = (location.state as LocationState | null)?.from;
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

      <div className="btn-group mb-3" role="group" aria-label="login-method">
        <button type="button" className={`btn btn-sm ${method === "email" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMethod("email")}>이메일</button>
        <button type="button" className={`btn btn-sm ${method === "id" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMethod("id")}>아이디</button>
        <button type="button" className={`btn btn-sm ${method === "phone" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMethod("phone")}>휴대폰</button>
      </div>

      <form className="card p-4" onSubmit={onSubmit}>
        <label className="form-label">{idLabel}</label>
        <input className="form-control mb-3" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />

        <label className="form-label">비밀번호</label>
        <input type="password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="d-flex justify-content-between mt-3 small">
        <Link to="/signup">회원가입</Link>
        <Link to="/oauth2">OAuth2 인가 URL 시작</Link>
      </div>
    </main>
  );
}
