import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../../../api/adminApi";
import PageFrame from "../../../components/common/PageFrame";
import Pagination from "../../../components/common/Pagination";
import type { UserListItem } from "../../../types/admin";
import type { PageResponse } from "../../../types/api";
import { formatDateTime } from "../../../utils/format";
import { useAdminShell } from "../useAdminShell";

const EMPTY_PAGE: PageResponse<UserListItem> = {
  content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, numberOfElements: 0, first: true, last: true, empty: true,
};

export default function UsersPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const [data, setData] = useState<PageResponse<UserListItem>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [provider, setProvider] = useState("");
  const [sort] = useState("userId,desc");
  const [error, setError] = useState("");

  const load = useCallback(async (targetPage: number): Promise<void> => {
    setError("");
    try {
      const response = await getUsers({
        page: targetPage,
        size,
        sort,
        keyword: keyword.trim() || undefined,
        userStatus: status || undefined,
        role: role || undefined,
        authProvider: provider || undefined,
      });
      setData(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "사용자 조회 실패");
    }
  }, [keyword, provider, role, size, sort, status]);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  async function onSearch(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPage(0);
    await load(0);
  }

  return (
    <PageFrame title="사용자 목록" onToggleSidebar={toggleSidebar}>
      <form className="row g-2 mb-3" onSubmit={onSearch}>
        <div className="col-12 col-md-3"><input className="form-control" placeholder="검색어" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
        <div className="col-12 col-md-2">
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">상태 전체</option><option value="ACTIVE">ACTIVE</option><option value="BLOCKED">BLOCKED</option><option value="SOFT_DELETED">SOFT_DELETED</option>
          </select>
        </div>
        <div className="col-12 col-md-2">
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">권한 전체</option><option value="USER">USER</option><option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="col-12 col-md-2"><input className="form-control" placeholder="authProvider" value={provider} onChange={(e) => setProvider(e.target.value)} /></div>
        <div className="col-12 col-md-1"><input type="number" className="form-control" value={size} onChange={(e) => setSize(Number(e.target.value) || 20)} /></div>
        <div className="col-12 col-md-2"><button className="btn btn-primary w-100" type="submit">조회</button></div>
      </form>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle text-center">
          <thead><tr><th>userId</th><th>email</th><th>name</th><th>role</th><th>provider</th><th>status</th><th>deletedAt</th></tr></thead>
          <tbody>
            {data.content.map((item) => (
              <tr key={String(item.userId)}>
                <td><Link to={`/users/${encodeURIComponent(String(item.userId))}`}>{item.userId}</Link></td>
                <td>{item.email ?? "-"}</td>
                <td>{item.name ?? "-"}</td>
                <td>{item.role ?? "-"}</td>
                <td>{item.authProvider ?? "-"}</td>
                <td>{item.userStatus ?? "-"}</td>
                <td>{formatDateTime(item.deletedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={data.number} totalPages={data.totalPages} onPageChange={setPage} />
    </PageFrame>
  );
}
