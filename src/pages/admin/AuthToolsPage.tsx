import {FormEvent, useState} from "react";
import AdminPage from "../../components/admin/AdminPage";
import {callTestApi, getOAuthAuthorizeUrl, logout, refreshToken} from "../../lib/auth-service/client";

type Props = {
    toggleSidebar?: () => void;
};

export default function AuthToolsPage({toggleSidebar}: Props) {
    const [provider, setProvider] = useState("google");
    const [resultText, setResultText] = useState("");

    async function runAction(action: () => Promise<unknown>) {
        try {
            const result = await action();
            setResultText(JSON.stringify(result ?? {ok: true}, null, 2));
        } catch (e) {
            setResultText(e instanceof Error ? e.message : "요청 실패");
        }
    }

    async function copyResult() {
        if (!resultText) return;
        try {
            await navigator.clipboard.writeText(resultText);
            setResultText((prev) => `${prev}\n\n[복사 완료]`);
        } catch {
            setResultText((prev) => `${prev}\n\n[복사 실패: 브라우저 권한 확인 필요]`);
        }
    }

    function onCustomPost(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const path = String(form.get("path") ?? "").trim();
        const bodyText = String(form.get("body") ?? "").trim();

        if (!path) return;

        let body: unknown = {};
        if (bodyText) {
            try {
                body = JSON.parse(bodyText);
            } catch {
                setResultText("body JSON 파싱에 실패했습니다.");
                return;
            }
        }

        void runAction(async () => await callTestApi(path, "POST", body));
    }

    return (
        <AdminPage title="인증 테스트 도구" toggleSidebar={toggleSidebar}>
            <div className="alert alert-warning py-2">운영 관리자 메뉴와 분리된 QA/개발용 도구입니다.</div>

            <div className="d-flex gap-2 flex-wrap mb-3">
                <button className="btn btn-outline-primary btn-sm" onClick={() => void runAction(async () => {
                    await refreshToken();
                    return {message: "토큰 재발급 성공"};
                })}>
                    토큰 재발급
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => void runAction(async () => {
                    await logout(false);
                    return {message: "현재 디바이스 로그아웃 완료"};
                })}>
                    로그아웃(현재 디바이스)
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => void runAction(async () => {
                    await logout(true);
                    return {message: "전체 로그아웃 완료"};
                })}>
                    전체 로그아웃
                </button>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-12 col-md-3">
                    <input className="form-control" value={provider} onChange={(e) => setProvider(e.target.value)}
                           placeholder="provider"/>
                </div>
                <div className="col-12 col-md-3">
                    <button className="btn btn-outline-dark w-100"
                            onClick={() => void runAction(async () => await getOAuthAuthorizeUrl(provider))}>
                        OAuth2 인가 URL 조회
                    </button>
                </div>
            </div>

            <form className="card p-3 mb-3" onSubmit={onCustomPost}>
                <h6>커스텀 POST 호출</h6>
                <input name="path" className="form-control mb-2" placeholder="/api/v1/auth/local/signup"/>
                <textarea name="body" className="form-control mb-2" rows={4}
                          placeholder='{"email":"test@example.com","password":"1234"}'/>
                <button className="btn btn-primary" type="submit">요청 실행</button>
            </form>

            <div className="d-flex gap-2 justify-content-end mb-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => void copyResult()}>결과 복사</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setResultText("")}>결과 지우기</button>
            </div>
            <pre className="bg-light p-3 border rounded" style={{minHeight: "220px", whiteSpace: "pre-wrap"}}>
                {resultText || "실행 결과가 여기에 표시됩니다."}
            </pre>
        </AdminPage>
    );
}
