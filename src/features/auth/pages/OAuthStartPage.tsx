import { FormEvent, useState } from "react";
import { getOAuthAuthorizeUrl } from "../../../api/authApi";

export default function OAuthStartPage(): JSX.Element {
  const [provider, setProvider] = useState("google");
  const [returnUrl, setReturnUrl] = useState("/");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setResultUrl("");

    try {
      const url = await getOAuthAuthorizeUrl(provider, returnUrl);
      setResultUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "요청에 실패했습니다.");
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: "680px" }}>
      <h3 className="mb-3">OAuth2 인가 URL 시작</h3>
      <p className="text-muted small">보안 규칙: `returnUrl`은 반드시 `/`로 시작하는 상대 경로여야 합니다.</p>

      <form className="card p-4" onSubmit={onSubmit}>
        <label className="form-label">Provider</label>
        <input className="form-control mb-3" value={provider} onChange={(e) => setProvider(e.target.value)} required />

        <label className="form-label">returnUrl</label>
        <input className="form-control mb-3" value={returnUrl} onChange={(e) => setReturnUrl(e.target.value)} required />

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button className="btn btn-primary" type="submit">인가 URL 조회</button>
      </form>

      {resultUrl && (
        <div className="card p-3 mt-3">
          <div className="small text-muted mb-1">조회 결과</div>
          <a href={resultUrl} target="_blank" rel="noreferrer">{resultUrl}</a>
        </div>
      )}
    </main>
  );
}
