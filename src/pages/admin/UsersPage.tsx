import {FormEvent, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import AdminPage from "../../components/admin/AdminPage";
import Pager from "../../components/admin/Pager";
import {frontBaseUrl} from "../../build_constants";
import {getUsers} from "../../lib/auth-service/client";
import type {PageResponse, UserListItem} from "../../types/auth-service";
import {fmtDateTime} from "../../utils/format";

type Props = {
    toggleSidebar?: () => void;
};

const EMPTY_PAGE: PageResponse<UserListItem> = {
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

export default function UsersPage({toggleSidebar}: Props) {
    const [data, setData] = useState<PageResponse<UserListItem>>(EMPTY_PAGE);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [keyword, setKeyword] = useState("");
    const [userStatus, setUserStatus] = useState("");
    const [role, setRole] = useState("");
    const [authProvider, setAuthProvider] = useState("");
    const [sort, setSort] = useState("userId,desc");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        void loadData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size, keyword, userStatus, role, authProvider, sort]);

    async function loadData(targetPage: number) {
        setLoading(true);
        setError("");
        try {
            const res = await getUsers({
                page: targetPage,
                size,
                keyword: keyword.trim() || undefined,
                userStatus: userStatus || undefined,
                role: role || undefined,
                authProvider: authProvider || undefined,
                sort: sort || undefined,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "사용자 목록 조회에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }

    async function onSearch(e: FormEvent) {
        e.preventDefault();
        setPage(0);
        await loadData(0);
    }

    async function onResetFilters() {
        setKeyword("");
        setUserStatus("");
        setRole("");
        setAuthProvider("");
        setSize(20);
        setSort("userId,desc");
        setPage(0);
        await loadData(0);
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
        <AdminPage title="통합 사용자 목록" toggleSidebar={toggleSidebar}>
            <form className="row g-2 mb-3" onSubmit={onSearch}>
                <div className="col-12 col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="email / name / nickname / phone"
                    />
                </div>
                <div className="col-12 col-md-2">
                    <select className="form-select" value={userStatus} onChange={(e) => setUserStatus(e.target.value)}>
                        <option value="">모든 상태</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="SOFT_DELETED">SOFT_DELETED</option>
                    </select>
                </div>
                <div className="col-12 col-md-2">
                    <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="">모든 권한</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
                <div className="col-12 col-md-2">
                    <select className="form-select" value={authProvider} onChange={(e) => setAuthProvider(e.target.value)}>
                        <option value="">모든 제공자</option>
                        <option value="LOCAL">LOCAL</option>
                        <option value="GOOGLE">GOOGLE</option>
                        <option value="NAVER">NAVER</option>
                        <option value="KAKAO">KAKAO</option>
                    </select>
                </div>
                <div className="col-12 col-md-1">
                    <input type="number" className="form-control" value={size} min={1} max={200}
                           onChange={(e) => setSize(Number(e.target.value) || 20)}/>
                </div>
                <div className="col-12 col-md-1">
                    <button className="btn btn-primary w-100" type="submit">조회</button>
                </div>
                <div className="col-12 col-md-1">
                    <button className="btn btn-outline-secondary w-100" type="button" onClick={() => void onResetFilters()}>
                        초기화
                    </button>
                </div>
            </form>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            {loading && <div className="text-muted">로딩 중...</div>}
            <div className="small text-muted mb-2">
                활성 필터: 상태 {userStatus || "전체"} | 권한 {role || "전체"} | 제공자 {authProvider || "전체"} | 키워드 {keyword || "-"}
            </div>
            <div className="small text-muted mb-2">총 {data.totalElements ?? 0}건</div>

            <div className="table-responsive">
                <table className="table table-sm table-hover align-middle text-center">
                    <thead>
                    <tr>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("userId")}>userId {renderSortIcon("userId")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("email")}>email {renderSortIcon("email")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("name")}>name {renderSortIcon("name")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("nickname")}>nickname {renderSortIcon("nickname")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("role")}>role {renderSortIcon("role")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("authProvider")}>authProvider {renderSortIcon("authProvider")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("userStatus")}>userStatus {renderSortIcon("userStatus")}</th>
                        <th>blocked</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("deletedAt")}>deletedAt {renderSortIcon("deletedAt")}</th>
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
                            <td>{item.email ?? "-"}</td>
                            <td>{item.name ?? "-"}</td>
                            <td>{item.nickname ?? "-"}</td>
                            <td>{item.role ?? "-"}</td>
                            <td>{item.authProvider ?? "-"}</td>
                            <td>{item.userStatus ?? "-"}</td>
                            <td>{String(Boolean(item.blocked))}</td>
                            <td>{fmtDateTime(item.deletedAt)}</td>
                        </tr>
                    ))}
                    {data.content.length === 0 && (
                        <tr>
                            <td colSpan={9} className="text-center text-muted">데이터가 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <Pager page={data.number ?? page} totalPages={data.totalPages ?? 0} onPageChange={setPage}/>
        </AdminPage>
    );
}
