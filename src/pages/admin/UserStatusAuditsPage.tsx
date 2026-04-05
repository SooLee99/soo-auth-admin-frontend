import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import AdminPage from "../../components/admin/AdminPage";
import Pager from "../../components/admin/Pager";
import {getUserStatusAudits} from "../../lib/auth-service/client";
import type {PageResponse, UserStatusAuditItem} from "../../types/auth-service";
import {fmtDateTime} from "../../utils/format";
import {frontBaseUrl} from "../../build_constants";

type Props = {
    toggleSidebar?: () => void;
};

const EMPTY_PAGE: PageResponse<UserStatusAuditItem> = {
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

export default function UserStatusAuditsPage({toggleSidebar}: Props) {
    const params = useParams<{userId: string}>();
    const userId = params.userId ?? "";

    const [data, setData] = useState<PageResponse<UserStatusAuditItem>>(EMPTY_PAGE);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [sort, setSort] = useState("actionAt,desc");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) return;
        void loadData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, page, size, sort]);

    async function loadData(targetPage: number) {
        setLoading(true);
        setError("");
        try {
            const res = await getUserStatusAudits(userId, {page: targetPage, size, sort});
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
        <AdminPage
            title={`사용자 상태 변경 이력 (${userId || "-"})`}
            toggleSidebar={toggleSidebar}
            actions={
                <Link className="btn btn-outline-primary btn-sm" to={`${frontBaseUrl}/users/${encodeURIComponent(userId)}`}>
                    사용자 상세
                </Link>
            }
        >
            <div className="row g-2 mb-3">
                <div className="col-12 col-md-2">
                    <input type="number" className="form-control" value={size} min={1} max={200}
                           onChange={(e) => setSize(Number(e.target.value) || 20)}/>
                </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            {loading && <div className="text-muted">로딩 중...</div>}

            <div className="table-responsive">
                <table className="table table-sm align-middle text-center">
                    <thead>
                    <tr>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("id")}>id {renderSortIcon("id")}</th>
                        <th>targetUserId</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("actorUserId")}>actorUserId {renderSortIcon("actorUserId")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("actionType")}>actionType {renderSortIcon("actionType")}</th>
                        <th>reason</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("actionAt")}>actionAt {renderSortIcon("actionAt")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.content.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.targetUserId}</td>
                            <td>{item.actorUserId ?? "-"}</td>
                            <td>{item.actionType ?? "-"}</td>
                            <td>{item.reason ?? "-"}</td>
                            <td>{fmtDateTime(item.actionAt)}</td>
                        </tr>
                    ))}
                    {data.content.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center text-muted">데이터가 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <Pager page={data.number ?? page} totalPages={data.totalPages ?? 0} onPageChange={setPage}/>
        </AdminPage>
    );
}
