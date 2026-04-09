import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlockedUsers, unblockUser } from "../../../api/adminApi";
import PageFrame from "../../../components/common/PageFrame";
import Pagination from "../../../components/common/Pagination";
import type { UserStatusItem } from "../../../types/admin";
import type { PageResponse } from "../../../types/api";
import { formatDateTime } from "../../../utils/format";
import { useAdminShell } from "../useAdminShell";

const EMPTY_PAGE: PageResponse<UserStatusItem> = {
  content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, numberOfElements: 0, first: true, last: true, empty: true,
};

export default function BlockedUsersPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const [data, setData] = useState<PageResponse<UserStatusItem>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [error, setError] = useState("");

  const load = useCallback(async (targetPage: number): Promise<void> => {
    setError("");
    try {
      setData(await getBlockedUsers({ page: targetPage, size }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "차단 사용자 조회 실패");
    }
  }, [size]);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  async function onUnblock(userId: string | number): Promise<void> {
    try {
      await unblockUser(String(userId));
      await load(page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "차단 해제 실패");
    }
  }

  return (
    <PageFrame title="차단 사용자 목록" onToggleSidebar={toggleSidebar}>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-2"><input type="number" className="form-control" value={size} onChange={(e) => setSize(Number(e.target.value) || 20)} /></div>
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle text-center">
          <thead><tr><th>userId</th><th>status</th><th>reason</th><th>blockedAt</th><th>actions</th></tr></thead>
          <tbody>
            {data.content.map((item) => (
              <tr key={String(item.userId)}>
                <td><Link to={`/users/${encodeURIComponent(String(item.userId))}`}>{item.userId}</Link></td>
                <td>{item.userStatus ?? "-"}</td>
                <td>{item.blockedReason ?? "-"}</td>
                <td>{formatDateTime(item.blockedAt)}</td>
                <td><button className="btn btn-outline-secondary btn-sm" onClick={() => void onUnblock(item.userId)}>차단 해제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data.number} totalPages={data.totalPages} onPageChange={setPage} />
    </PageFrame>
  );
}
