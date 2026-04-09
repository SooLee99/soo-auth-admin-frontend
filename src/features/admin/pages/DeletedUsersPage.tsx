import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDeletedUsers } from "../../../api/adminApi";
import PageFrame from "../../../components/common/PageFrame";
import Pagination from "../../../components/common/Pagination";
import type { UserStatusItem } from "../../../types/admin";
import type { PageResponse } from "../../../types/api";
import { formatDateTime } from "../../../utils/format";
import { useAdminShell } from "../useAdminShell";

const EMPTY_PAGE: PageResponse<UserStatusItem> = {
  content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, numberOfElements: 0, first: true, last: true, empty: true,
};

export default function DeletedUsersPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const [data, setData] = useState<PageResponse<UserStatusItem>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [error, setError] = useState("");

  const load = useCallback(async (targetPage: number): Promise<void> => {
    setError("");
    try {
      setData(await getDeletedUsers({ page: targetPage, size }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "탈퇴 사용자 조회 실패");
    }
  }, [size]);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  return (
    <PageFrame title="탈퇴 사용자 목록" onToggleSidebar={toggleSidebar}>
      <div className="row g-2 mb-3"><div className="col-12 col-md-2"><input type="number" className="form-control" value={size} onChange={(e) => setSize(Number(e.target.value) || 20)} /></div></div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle text-center">
          <thead><tr><th>userId</th><th>deletedAt</th><th>deletionReason</th><th>retentionUntil</th></tr></thead>
          <tbody>
            {data.content.map((item) => (
              <tr key={String(item.userId)}>
                <td><Link to={`/users/${encodeURIComponent(String(item.userId))}`}>{item.userId}</Link></td>
                <td>{formatDateTime(item.deletedAt)}</td>
                <td>{item.deletionReason ?? "-"}</td>
                <td>{formatDateTime(item.retentionUntil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data.number} totalPages={data.totalPages} onPageChange={setPage} />
    </PageFrame>
  );
}
