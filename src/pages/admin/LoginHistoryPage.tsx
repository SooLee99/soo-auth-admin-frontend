import {FormEvent, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import AdminPage from "../../components/admin/AdminPage";
import Pager from "../../components/admin/Pager";
import {getLoginHistory} from "../../lib/auth-service/client";
import type {PageResponse, LoginHistoryItem} from "../../types/auth-service";
import {fmtDateTime} from "../../utils/format";
import {frontBaseUrl} from "../../build_constants";

type Props = {
    toggleSidebar?: () => void;
};

const EMPTY_PAGE: PageResponse<LoginHistoryItem> = {
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

export default function LoginHistoryPage({toggleSidebar}: Props) {
    const [data, setData] = useState<PageResponse<LoginHistoryItem>>(EMPTY_PAGE);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [sort, setSort] = useState("createdAt,desc");
    const [statusFilter, setStatusFilter] = useState("");
    const [loginTypeFilter, setLoginTypeFilter] = useState("");
    const [keyword, setKeyword] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [useDateFilter, setUseDateFilter] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        void loadData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size, sort, statusFilter, loginTypeFilter, keyword]);

    async function loadData(targetPage: number) {
        setLoading(true);
        setError("");
        try {
            const res = await getLoginHistory({
                page: targetPage,
                size,
                sort,
                startDate: useDateFilter ? startDate || undefined : undefined,
                endDate: useDateFilter ? endDate || undefined : undefined,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "조회에 실패했습니다.");
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
        setStartDate("");
        setEndDate("");
        setUseDateFilter(false);
        setStatusFilter("");
        setLoginTypeFilter("");
        setKeyword("");
        setSort("createdAt,desc");
        setSize(20);
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
        <AdminPage title="관리자 로그인 이력" toggleSidebar={toggleSidebar}>
            <form className="row g-2 mb-3" onSubmit={onSearch}>
                <div className="col-12 col-md-2 d-flex align-items-center">
                    <div className="form-check m-0">
                        <input
                            id="use-date-filter"
                            className="form-check-input"
                            type="checkbox"
                            checked={useDateFilter}
                            onChange={(e) => setUseDateFilter(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="use-date-filter">
                            기간 필터 사용
                        </label>
                    </div>
                </div>
                <div className="col-12 col-md-2">
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        disabled={!useDateFilter}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-2">
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        disabled={!useDateFilter}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="이메일/IP/디바이스 검색"
                    />
                </div>
                <div className="col-12 col-md-3">
                    <input type="text" className="form-control" value={sort} onChange={(e) => setSort(e.target.value)} placeholder="정렬 (예: createdAt,desc)"/>
                </div>
                <div className="col-12 col-md-2">
                    <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">모든 상태</option>
                        <option value="SUCCESS">SUCCESS</option>
                        <option value="FAIL">FAIL</option>
                    </select>
                </div>
                <div className="col-12 col-md-2">
                    <select
                        className="form-select"
                        value={loginTypeFilter}
                        onChange={(e) => setLoginTypeFilter(e.target.value)}
                    >
                        <option value="">모든 로그인 타입</option>
                        <option value="LOCAL">LOCAL</option>
                        <option value="GOOGLE">GOOGLE</option>
                        <option value="NAVER">NAVER</option>
                        <option value="KAKAO">KAKAO</option>
                    </select>
                </div>
                <div className="col-12 col-md-2">
                    <input type="number" className="form-control" value={size} min={1} max={200} onChange={(e) => setSize(Number(e.target.value) || 20)}/>
                </div>
                <div className="col-12 col-md-2">
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
            {!useDateFilter && <div className="small text-muted mb-2">기본값은 날짜 조건 없는 전체 조회입니다.</div>}
            <div className="small text-muted mb-2">
                활성 필터: 상태 {statusFilter || "전체"} | 로그인타입 {loginTypeFilter || "전체"}
            </div>
            <div className="small text-muted mb-2">총 {data.totalElements ?? 0}건</div>

            <div className="table-responsive">
                <table className="table table-sm table-hover align-middle text-center">
                    <thead>
                    <tr>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("id")}>id {renderSortIcon("id")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("userId")}>userId {renderSortIcon("userId")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("userEmail")}>userEmail {renderSortIcon("userEmail")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("loginType")}>loginType {renderSortIcon("loginType")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("status")}>status {renderSortIcon("status")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("ipAddress")}>ipAddress {renderSortIcon("ipAddress")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("deviceId")}>deviceId {renderSortIcon("deviceId")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("failureReason")}>failureReason {renderSortIcon("failureReason")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("createdAt")}>createdAt {renderSortIcon("createdAt")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.content.map((item) => {
                        const failed = (item.status ?? "").toUpperCase().includes("FAIL");
                        return (
                            <tr key={item.id} className={failed ? "table-danger" : ""}>
                                <td>{item.id}</td>
                                <td>
                                    {item.userId !== null && item.userId !== undefined ? (
                                        <Link className="btn btn-link btn-sm p-0" to={`${frontBaseUrl}/users/${encodeURIComponent(String(item.userId))}`}>
                                            {item.userId}
                                        </Link>
                                    ) : "-"}
                                </td>
                                <td>{item.userEmail ?? "-"}</td>
                                <td>{item.loginType ?? "-"}</td>
                                <td>{item.status ?? "-"}</td>
                                <td>{item.ipAddress ?? "-"}</td>
                                <td>{item.deviceId ?? "-"}</td>
                                <td>{item.failureReason ?? "-"}</td>
                                <td>{fmtDateTime(item.createdAt)}</td>
                            </tr>
                        );
                    })}
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
