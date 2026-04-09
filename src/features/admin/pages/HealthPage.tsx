import { useState } from "react";
import { getHealth } from "../../../api/adminApi";
import type { HealthSnapshot } from "../../../types/admin";
import PageFrame from "../../../components/common/PageFrame";
import StatusBadge from "../../../components/common/StatusBadge";
import { useAdminShell } from "../useAdminShell";

export default function HealthPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const [data, setData] = useState<HealthSnapshot | null>(null);
  const [error, setError] = useState("");

  async function load(): Promise<void> {
    setError("");
    try {
      setData(await getHealth());
    } catch (e) {
      setError(e instanceof Error ? e.message : "헬스 조회 실패");
    }
  }

  return (
    <PageFrame title="헬스 체크" onToggleSidebar={toggleSidebar} actions={<button className="btn btn-outline-primary btn-sm" onClick={() => void load()}>재조회</button>}>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {!data && <div className="alert alert-secondary py-2">아직 조회하지 않았습니다.</div>}
      {data && (
        <div className="card p-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span>overall:</span>
            <StatusBadge value={data.status} />
          </div>
          <div className="small text-muted">application: {data.application ?? "-"}</div>
          <pre className="bg-light border rounded p-2 mt-2 mb-0" style={{ maxHeight: 420, overflow: "auto" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </PageFrame>
  );
}
