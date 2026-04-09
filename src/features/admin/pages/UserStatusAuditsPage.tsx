import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserStatusAudits } from "../../../api/adminApi";
import PageFrame from "../../../components/common/PageFrame";
import Pagination from "../../../components/common/Pagination";
import type { UserStatusAuditItem } from "../../../types/admin";
import type { PageResponse } from "../../../types/api";
import { formatDateTime } from "../../../utils/format";
import { useAdminShell } from "../useAdminShell";

const EMPTY_PAGE: PageResponse<UserStatusAuditItem> = {
  content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, numberOfElements: 0, first: true, last: true, empty: true,
};

export default function UserStatusAuditsPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const { userId = "" } = useParams();
  const [data, setData] = useState<PageResponse<UserStatusAuditItem>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("actionAt,desc");
  const [error, setError] = useState("");

  const load = useCallback(async (targetPage: number): Promise<void> => {
    setError("");
    try {
      setData(await getUserStatusAudits(userId, { page: targetPage, size, sort }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "상태 이력 조회 실패");
    }
  }, [size, sort, userId]);

  useEffect(() => {
    if (!userId) return;
    void load(page);
  }, [load, page, userId]);

  return (
    <PageFrame title={`사용자 상태 변경 이력 (${userId})`} onToggleSidebar={toggleSidebar} actions={<Link className="btn btn-outline-primary btn-sm" to={`/users/${encodeURIComponent(userId)}`}>상세</Link>}>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-2"><input type="number" className="form-control" value={size} onChange={(e) => setSize(Number(e.target.value) || 20)} /></div>
        <div className="col-12 col-md-3"><input className="form-control" value={sort} onChange={(e) => setSort(e.target.value)} /></div>
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <table className="table table-sm table-hover text-center">
        <thead><tr><th>id</th><th>targetUserId</th><th>actorUserId</th><th>actionType</th><th>reason</th><th>actionAt</th></tr></thead>
        <tbody>
          {data.content.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td><td>{item.targetUserId}</td><td>{item.actorUserId ?? "-"}</td><td>{item.actionType ?? "-"}</td><td>{item.reason ?? "-"}</td><td>{formatDateTime(item.actionAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={data.number} totalPages={data.totalPages} onPageChange={setPage} />
    </PageFrame>
  );
}
