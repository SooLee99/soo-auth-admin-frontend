import {FormEvent, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {frontBaseUrl} from "../../build_constants";
import AdminPage from "../../components/admin/AdminPage";
import Pager from "../../components/admin/Pager";
import {blockUser, getBlockedUsers, getUsers, unblockUser} from "../../lib/auth-service/client";
import type {PageResponse, UserListItem, UserStatusItem} from "../../types/auth-service";
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

const EMPTY_USER_PAGE: PageResponse<UserListItem> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
};

export default function BlockedUsersPage({toggleSidebar}: Props) {
    const [data, setData] = useState<PageResponse<UserStatusItem>>(EMPTY_PAGE);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [sort, setSort] = useState("blockedAt,desc");
    const [keyword, setKeyword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [blockUserId, setBlockUserId] = useState("");
    const [blockReason, setBlockReason] = useState("");

    // 모달 관련 상태
    const [showModal, setShowModal] = useState(false);
    const [userSearchKeyword, setUserSearchKeyword] = useState("");
    const [userSearchData, setUserSearchData] = useState<PageResponse<UserListItem>>(EMPTY_USER_PAGE);
    const [, setUserSearchPage] = useState(0);
    const [userSearchLoading, setUserSearchLoading] = useState(false);

    useEffect(() => {
        void loadData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size, keyword, sort]);

    async function loadData(targetPage: number) {
        setLoading(true);
        setError("");
        try {
            const scopedRes = await getBlockedUsers({
                page: targetPage,
                size,
            });
            setData(scopedRes);
        } catch (e) {
            setError(e instanceof Error ? e.message : "조회에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }

    async function onBlockSubmit(e: FormEvent) {
        e.preventDefault();
        if (!blockUserId.trim()) {
            setError("차단할 사용자를 선택해 주세요.");
            return;
        }

        try {
            await blockUser(blockUserId.trim(), blockReason.trim() || undefined);
            setBlockUserId("");
            setBlockReason("");
            setShowModal(false);
            await loadData(0);
            setPage(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "차단 처리에 실패했습니다.");
        }
    }

    async function searchUsers(targetPage: number) {
        setUserSearchLoading(true);
        try {
            const res = await getUsers({
                page: targetPage,
                size: 10,
                keyword: userSearchKeyword.trim() || undefined,
                sort: "createdAt,desc"
            });
            setUserSearchData(res);
            setUserSearchPage(targetPage);
        } catch (e) {
            console.error("사용자 검색 실패", e);
        } finally {
            setUserSearchLoading(false);
        }
    }

    const openModal = () => {
        setShowModal(true);
        setBlockUserId("");
        setBlockReason("");
        setUserSearchKeyword("");
        setUserSearchData(EMPTY_USER_PAGE);
        setUserSearchPage(0);
    };

    async function onUnblock(userId: string | number) {
        if (!window.confirm(`userId=${userId} 차단을 해제하시겠습니까?`)) return;

        try {
            await unblockUser(String(userId));
            await loadData(page);
        } catch (err) {
            setError(err instanceof Error ? err.message : "차단 해제에 실패했습니다.");
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
            title="차단 사용자 목록"
            toggleSidebar={toggleSidebar}
            actions={
                <button className="btn btn-danger btn-sm" onClick={openModal}>
                    + 사용자 차단 등록
                </button>
            }
        >
            <div className="row g-2 mb-3">
                <div className="col-12 col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="userId/상태/사유 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-2">
                    <input type="number" className="form-control" value={size} min={1} max={200}
                           onChange={(e) => setSize(Number(e.target.value) || 20)}/>
                </div>
                <div className="col-12 col-md-3">
                    <button className="btn btn-outline-secondary w-100" onClick={() => void loadData(page)}>검색/새로고침</button>
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
                        <th>blocked</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("blockedReason")}>blockedReason {renderSortIcon("blockedReason")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("blockedAt")}>blockedAt {renderSortIcon("blockedAt")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("blockedByAdminId")}>blockedByAdminId {renderSortIcon("blockedByAdminId")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("unblockedAt")}>unblockedAt {renderSortIcon("unblockedAt")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => toggleSort("retentionUntil")}>retentionUntil {renderSortIcon("retentionUntil")}</th>
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
                            <td>{String(Boolean(item.blocked))}</td>
                            <td>{item.blockedReason ?? "-"}</td>
                            <td>{fmtDateTime(item.blockedAt)}</td>
                            <td>{item.blockedByAdminId ?? "-"}</td>
                            <td>{fmtDateTime(item.unblockedAt)}</td>
                            <td>{fmtDateTime(item.retentionUntil)}</td>
                            <td className="d-flex gap-2">
                                <Link className="btn btn-outline-secondary btn-sm"
                                      to={`${frontBaseUrl}/users/${encodeURIComponent(String(item.userId))}/status-audits`}>
                                    이력
                                </Link>
                                <Link className="btn btn-outline-primary btn-sm"
                                      to={`${frontBaseUrl}/users/${encodeURIComponent(String(item.userId))}`}>
                                    상세
                                </Link>
                                <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => onUnblock(item.userId)}>
                                    차단 해제
                                </button>
                            </td>
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

            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">사용자 차단 등록</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-4">
                                    <h6>1. 차단할 사용자 검색/선택</h6>
                                    <div className="input-group mb-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="아이디, 이메일, 이름 등으로 검색"
                                            value={userSearchKeyword}
                                            onChange={(e) => setUserSearchKeyword(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && void searchUsers(0)}
                                        />
                                        <button className="btn btn-primary" onClick={() => void searchUsers(0)}>검색</button>
                                    </div>

                                    <div className="table-responsive" style={{maxHeight: "300px"}}>
                                        <table className="table table-sm table-hover align-middle text-center small">
                                            <thead className="table-light sticky-top">
                                            <tr>
                                                <th>선택</th>
                                                <th>userId</th>
                                                <th>아이디</th>
                                                <th>이름</th>
                                                <th>상태</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {userSearchData.content.map((u) => (
                                                <tr key={u.userId}
                                                    style={{cursor: "pointer"}}
                                                    className={blockUserId === String(u.userId) ? "table-primary" : ""}
                                                    onClick={() => setBlockUserId(String(u.userId))}
                                                >
                                                    <td>
                                                        <input
                                                            type="radio"
                                                            checked={blockUserId === String(u.userId)}
                                                            onChange={() => setBlockUserId(String(u.userId))}
                                                        />
                                                    </td>
                                                    <td>{u.userId}</td>
                                                    <td>{u.name}</td>
                                                    <td>{u.nickname || u.name || "-"}</td>
                                                    <td>{u.userStatus}</td>
                                                </tr>
                                            ))}
                                            {userSearchData.content.length === 0 && !userSearchLoading && (
                                                <tr><td colSpan={5} className="py-3 text-muted">검색 결과가 없습니다.</td></tr>
                                            )}
                                            {userSearchLoading && (
                                                <tr><td colSpan={5} className="py-3 text-muted">검색 중...</td></tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {userSearchData.totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-2">
                                            <Pager
                                                page={userSearchData.number}
                                                totalPages={userSearchData.totalPages}
                                                onPageChange={(p) => void searchUsers(p)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <h6>2. 차단 정보 입력</h6>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small">선택된 사용자 ID</label>
                                            <input type="text" className="form-control" value={blockUserId} readOnly placeholder="사용자를 선택하세요" />
                                        </div>
                                        <div className="col-md-8">
                                            <label className="form-label small">차단 사유 (선택)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="예: 운영 정책 위반"
                                                value={blockReason}
                                                onChange={(e) => setBlockReason(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>취소</button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={onBlockSubmit}
                                    disabled={!blockUserId}
                                >
                                    차단하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminPage>
    );
}
