import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getLoginHistory } from "../../../api/adminApi";
import PageFrame from "../../../components/common/PageFrame";
import Pagination from "../../../components/common/Pagination";
import type { LoginHistoryItem } from "../../../types/admin";
import type { PageResponse } from "../../../types/api";
import { formatDateTime } from "../../../utils/format";
import { useAdminShell } from "../useAdminShell";

const EMPTY_PAGE: PageResponse<LoginHistoryItem> = {
  content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, numberOfElements: 0, first: true, last: true, empty: true,
};

export default function UserLoginHistoryPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const { userId = "" } = useParams();
  const [data, setData] = useState<PageResponse<LoginHistoryItem>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async (targetPage: number): Promise<void> => {
    setError("");
    try {
      setData(await getLoginHistory({ page: targetPage, size: 20, sort: "createdAt,desc", userId }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "조회 실패");
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void load(page);
  }, [load, page, userId]);

  return (
    <PageFrame title={`사용자 로그인 이력 (${userId})`} onToggleSidebar={toggleSidebar}>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <table className="table table-sm table-hover text-center">
        <thead><tr><th>id</th><th>email</th><th>status</th><th>deviceId</th><th>createdAt</th></tr></thead>
        <tbody>
          {data.content.map((item) => (
            <tr key={item.id}><td>{item.id}</td><td>{item.userEmail ?? "-"}</td><td>{item.status ?? "-"}</td><td>{item.deviceId ?? "-"}</td><td>{formatDateTime(item.createdAt)}</td></tr>
          ))}
        </tbody>
      </table>
      <Pagination page={data.number} totalPages={data.totalPages} onPageChange={setPage} />
    </PageFrame>
  );
}
