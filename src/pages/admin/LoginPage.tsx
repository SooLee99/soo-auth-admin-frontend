import {FormEvent, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {frontBaseUrl} from "../../build_constants";
import {login} from "../../lib/auth-service/client";
import {hasSession, setDeviceId} from "../../lib/auth-service/session";

type NavigateState = {
    from?: {
        pathname?: string;
    };
    authError?: "forbidden" | "login-required";
};

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const state = location.state as NavigateState | null;
    const [sessionAuthError, setSessionAuthError] = useState<"expired" | "login-required" | "">("");
    const authError = state?.authError;

    useEffect(() => {
        if (hasSession()) {
            navigate(`${frontBaseUrl}/`, {replace: true});
        }
    }, [navigate]);

    useEffect(() => {
        const reason = sessionStorage.getItem("auth_redirect_reason");
        if (reason === "expired" || reason === "login-required") {
            setSessionAuthError(reason);
            sessionStorage.removeItem("auth_redirect_reason");
        }
    }, []);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") ?? "").trim();
        const password = String(form.get("password") ?? "");
        const inputDeviceId = String(form.get("deviceId") ?? "").trim();

        if (!email || !password) {
            setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            if (inputDeviceId) {
                setDeviceId(inputDeviceId);
            }

            await login({email, password}, inputDeviceId || undefined);

            const targetPath = state?.from?.pathname || `${frontBaseUrl}/`;
            navigate(targetPath, {replace: true});
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="container py-5" style={{maxWidth: "560px"}}>
            <h3 className="mb-3">관리자 로그인</h3>
            <p className="text-muted">soo-auth-service 관리자 페이지</p>
            {authError === "forbidden" && (
                <div className="alert alert-warning py-2">
                    접근 권한이 없습니다. 이 페이지는 <strong>ROLE_ADMIN</strong> 권한이 필요합니다.
                </div>
            )}
            {authError === "login-required" && (
                <div className="alert alert-secondary py-2">
                    로그인 세션이 없거나 만료되었습니다. 다시 로그인해 주세요.
                </div>
            )}
            {sessionAuthError === "expired" && (
                <div className="alert alert-secondary py-2">
                    인증이 만료되었습니다. 보안을 위해 로그인 페이지로 이동했습니다.
                </div>
            )}

            <form className="card p-4" onSubmit={onSubmit}>
                <label className="form-label">이메일</label>
                <input name="email" type="email" className="form-control mb-3" autoComplete="username" required/>

                <label className="form-label">비밀번호</label>
                <input name="password" type="password" className="form-control mb-3" autoComplete="current-password" required/>

                <label className="form-label">X-Device-Id ( 선택)</label>
                <input name="deviceId" type="text" className="form-control mb-3" placeholder="예: admin-laptop"/>

                {errorMessage && <div className="alert alert-danger py-2">{errorMessage}</div>}

                <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "로그인 중..." : "로그인"}
                </button>
            </form>
        </main>
    );
}
