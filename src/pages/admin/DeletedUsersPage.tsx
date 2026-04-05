import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {frontBaseUrl} from "../../build_constants";
import AdminPage from "../../components/admin/AdminPage";
import Pager from "../../components/admin/Pager";
import {getDeletedUsers} from "../../lib/auth-service/client";
import type {PageResponse, UserStatusItem} from "../../types/auth-service";
import {fmtDateTime} from "../../utils/format";

type Props = {
    toggleSidebar?: () => void;
};

const EMPTY_PAGE: PageResponse<UserStatusItem> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
};

export default function DeletedUsersPage({toggleSidebar}: Props) {
    const [data, setData] = useState<PageResponse<UserStatusItem>>(EMPTY_PAGE);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [sort, setSort] = useState("deletedAt,desc");
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        void loadData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size, keyword, sort]);

    async function loadData(targetPage: number) {
        setLoading(true);
        setError("");
        try {
            const res = await getDeletedUsers({
                page: targetPage,
                size,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "조회에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }

    function toggleSort(field: string) {
        if (sort.startsWith(field)) {
            if (sort.endsWith(",asc")) {
                setSort(`${field},desc`);
            } else {
                setSort(`${field},asc`);
            }
        } else {
            setSort(`${field},asc`);
        }
        setPage(0);
    }

    function renderSortIcon(field: string) {
        if (!sort.startsWith(field)) return "↕️";
        return sort.endsWith(",asc") ? "↑" : "↓";
    }


    return (
        <AdminPage title="소프트 탈퇴 사용자 목록" toggleSidebar={toggleSidebar}>
            <div className="row g-2 mb-3">
                <div className="col-12 col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="userId/사유 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-2">
                    <input type="number" className="form-control" value={size} min={1} max={200}
                           onChange={(e) => setSize(Number(e.target.value) || 20)}/>
                </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            {loading && <div className="text-muted">로딩 중...</div>}
            <div className="small text-muted mb-2">활성 필터: 검색어 {keyword || "-"}</div>
            <div className="small text-muted mb-2">총 {data.totalElements ?? 0}건</div>

            <div className="table-responsive">
                <table className="table table-sm align-middle text-center">
                    <thead>
                    <tr>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("userId")}>userId {renderSortIcon("userId")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("userStatus")}>userStatus {renderSortIcon("userStatus")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("deletedAt")}>deletedAt {renderSortIcon("deletedAt")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("deletionReason")}>deletionReason {renderSortIcon("deletionReason")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("retentionUntil")}>retentionUntil {renderSortIcon("retentionUntil")}</th>
                        <th>blocked</th>
                        <th>blockedReason</th>
                        <th>액션</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.content.map((item) => (
                        <tr key={String(item.userId)}>
                            <td>
                                <Link className="btn btn-link btn-sm p-0" to={`${frontBaseUrl}/users/${encodeURIComponent(String(item.userId))}`}>
                                    {item.userId}
                                </Link>
                            </td>
                            <td>{item.userStatus ?? "-"}</td>
                            <td>{fmtDateTime(item.deletedAt)}</td>
                            <td>{item.deletionReason ?? "-"}</td>
                            <td><span className="badge text-bg-warning">{fmtDateTime(item.retentionUntil)}</span></td>
                            <td>{String(Boolean(item.blocked))}</td>
                            <td>{item.blockedReason ?? "-"}</td>
                            <td>
                                <Link className="btn btn-outline-primary btn-sm me-2"
                                      to={`${frontBaseUrl}/users/${encodeURIComponent(String(item.userId))}`}>
                                    상세
                                </Link>
                                <Link className="btn btn-outline-secondary btn-sm"
                                      to={`${frontBaseUrl}/users/${encodeURIComponent(String(item.userId))}/status-audits`}>
                                    이력
                                </Link>
                            </td>
                        </tr>
                    ))}
                    {data.content.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center text-muted">데이터가 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <Pager page={data.number ?? page} totalPages={data.totalPages ?? 0} onPageChange={setPage}/>
        </AdminPage>
    );
}
