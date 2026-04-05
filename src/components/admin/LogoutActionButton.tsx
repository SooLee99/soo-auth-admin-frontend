import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {frontBaseUrl} from "../../build_constants";
import {logout} from "../../lib/auth-service/client";

type Props = {
    className?: string;
    stacked?: boolean;
};

export default function LogoutActionButton({className, stacked = false}: Props) {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    async function onLogout(logoutAll: boolean) {
        if (submitting) return;
        const label = logoutAll ? "전체 로그아웃" : "로그아웃";
        if (!window.confirm(`${label} 하시겠습니까?`)) return;

        setSubmitting(true);
        try {
            await logout(logoutAll);
        } catch (err) {
            console.error("Logout failed:", err);
            // 서버 오류여도 로컬 세션은 logout() 내부의 finally에서 무효화됨
        } finally {
            setSubmitting(false);
            navigate(`${frontBaseUrl}/login`, {replace: true});
        }
    }

    return (
        <div className={`${stacked ? "d-grid gap-2" : "d-flex gap-2"} ${className ?? ""}`.trim()}>
            <button className={`btn btn-outline-secondary btn-sm ${stacked ? "w-100" : ""}`} disabled={submitting}
                    onClick={() => void onLogout(false)}>
                로그아웃
            </button>
            <button className={`btn btn-outline-danger btn-sm ${stacked ? "w-100" : ""}`} disabled={submitting}
                    onClick={() => void onLogout(true)}>
                전체 로그아웃
            </button>
        </div>
    );
}
