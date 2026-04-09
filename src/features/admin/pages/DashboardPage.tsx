import { useEffect, useState } from "react";
import { getHealth, getLoginHistory } from "../../../api/adminApi";
import type { HealthSnapshot, LoginHistoryItem } from "../../../types/admin";
import PageFrame from "../../../components/common/PageFrame";
import StatusBadge from "../../../components/common/StatusBadge";
import { useAdminShell } from "../useAdminShell";

export default function DashboardPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setError("");
    try {
      const [healthRes, historyRes] = await Promise.all([
        getHealth(),
        getLoginHistory({ page: 0, size: 20, sort: "createdAt,desc" }),
      ]);
      setHealth(healthRes);
      setHistory(historyRes.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "대시보드 조회에 실패했습니다.");
    }
  }

  return (
    <PageFrame title="대시보드" onToggleSidebar={toggleSidebar} actions={<button className="btn btn-outline-secondary btn-sm" onClick={() => void load()}>새로고침</button>}>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <div className="card p-3">
            <h6>헬스 상태</h6>
            <div className="small text-muted">application: {health?.application ?? "-"}</div>
            <div className="mt-2"><StatusBadge value={health?.status} /></div>
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="card p-3">
            <h6>최근 로그인 이력</h6>
            <div className="small text-muted">최근 {history.length}건</div>
            <ul className="small mb-0 mt-2">
              {history.slice(0, 5).map((item) => (
                <li key={item.id}>{item.userEmail ?? item.userId ?? "-"} / {item.status ?? "-"}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
