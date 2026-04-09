import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupByEmail, signupById, signupByPhone } from "../../../api/authApi";
import type { LoginMethod } from "../../../types/auth";

export default function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const [method, setMethod] = useState<LoginMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const idLabel = useMemo(() => {
    if (method === "email") return "이메일";
    if (method === "id") return "아이디";
    return "휴대폰";
  }, [method]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const value = identifier.trim();
    if (!value || !password) {
      setError("회원가입 정보를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const payload = { password, name: name.trim() || undefined };
      if (method === "email") {
        await signupByEmail({ email: value, ...payload });
      } else if (method === "id") {
        await signupById({ loginId: value, ...payload });
      } else {
        await signupByPhone({ phoneNumber: value, ...payload });
      }

      setNotice("회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: "560px" }}>
      <h3 className="mb-3">회원가입</h3>
      <div className="btn-group mb-3" role="group" aria-label="signup-method">
        <button type="button" className={`btn btn-sm ${method === "email" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMethod("email")}>이메일</button>
        <button type="button" className={`btn btn-sm ${method === "id" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMethod("id")}>아이디</button>
        <button type="button" className={`btn btn-sm ${method === "phone" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMethod("phone")}>휴대폰</button>
      </div>

      <form className="card p-4" onSubmit={onSubmit}>
        <label className="form-label">{idLabel}</label>
        <input className="form-control mb-3" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />

        <label className="form-label">이름(선택)</label>
        <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="form-label">비밀번호</label>
        <input type="password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {notice && <div className="alert alert-success py-2">{notice}</div>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "처리 중..." : "회원가입"}
        </button>
      </form>

      <div className="mt-3 small">
        <Link to="/login">로그인으로 돌아가기</Link>
      </div>
    </main>
  );
}
