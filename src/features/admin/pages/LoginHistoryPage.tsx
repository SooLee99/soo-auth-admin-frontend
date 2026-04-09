import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLoginHistory } from "../../../api/adminApi";
import Pagination from "../../../components/common/Pagination";
import PageFrame from "../../../components/common/PageFrame";
import type { LoginHistoryItem } from "../../../types/admin";
import type { PageResponse } from "../../../types/api";
import { formatDateTime } from "../../../utils/format";
import { useAdminShell } from "../useAdminShell";

const EMPTY_PAGE: PageResponse<LoginHistoryItem> = {
  content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, numberOfElements: 0, first: true, last: true, empty: true,
};

export default function LoginHistoryPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const [pageData, setPageData] = useState<PageResponse<LoginHistoryItem>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("createdAt,desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (targetPage: number): Promise<void> => {
    setError("");
    try {
      const data = await getLoginHistory({
        page: targetPage,
        size,
        sort,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setPageData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인 이력 조회 실패");
    }
  }, [endDate, size, sort, startDate]);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  async function onSearch(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPage(0);
    await load(0);
  }

  return (
    <PageFrame title="로그인 이력" onToggleSidebar={toggleSidebar}>
      <form className="row g-2 mb-3" onSubmit={onSearch}>
        <div className="col-12 col-md-2"><input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        <div className="col-12 col-md-2"><input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
        <div className="col-12 col-md-3"><input className="form-control" value={sort} onChange={(e) => setSort(e.target.value)} /></div>
        <div className="col-12 col-md-2"><input type="number" className="form-control" value={size} onChange={(e) => setSize(Number(e.target.value) || 20)} /></div>
        <div className="col-12 col-md-2"><button className="btn btn-primary w-100" type="submit">조회</button></div>
      </form>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle text-center">
          <thead><tr><th>id</th><th>userId</th><th>email</th><th>loginType</th><th>status</th><th>deviceId</th><th>createdAt</th></tr></thead>
          <tbody>
            {pageData.content.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.userId ? <Link to={`/users/${encodeURIComponent(String(item.userId))}`}>{item.userId}</Link> : "-"}</td>
                <td>{item.userEmail ?? "-"}</td>
                <td>{item.loginType ?? "-"}</td>
                <td>{item.status ?? "-"}</td>
                <td>{item.deviceId ?? "-"}</td>
                <td>{formatDateTime(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={pageData.number} totalPages={pageData.totalPages} onPageChange={setPage} />
    </PageFrame>
  );
}
