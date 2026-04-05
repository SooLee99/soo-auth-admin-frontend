import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import AdminPage from "../../components/admin/AdminPage";
import Pager from "../../components/admin/Pager";
import {getLoginHistory} from "../../lib/auth-service/client";
import type {PageResponse, LoginHistoryItem} from "../../types/auth-service";
import {fmtDateTime} from "../../utils/format";

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

export default function UserLoginHistoryPage({toggleSidebar}: Props) {
    const params = useParams<{userId: string}>();
    const userId = params.userId ?? "";

    const [data, setData] = useState<PageResponse<LoginHistoryItem>>(EMPTY_PAGE);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (userId) {
            void loadData(page);
        }
    }, [userId, page]);

    async function loadData(targetPage: number) {
        setLoading(true);
        setError("");
        try {
            const res = await getLoginHistory({
                page: targetPage,
                size: 20,
                sort: "createdAt,desc",
                userId: userId,
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "조회에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminPage title={`사용자 로그인 이력: ${userId}`} toggleSidebar={toggleSidebar}>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {loading && <div className="text-muted">로딩 중...</div>}
            
            <div className="small text-muted mb-2">총 {data.totalElements ?? 0}건</div>

            <div className="table-responsive">
                <table className="table table-sm table-hover align-middle text-center">
                    <thead>
                    <tr>
                        <th>id</th>
                        <th>userEmail</th>
                        <th>loginType</th>
                        <th>status</th>
                        <th>ipAddress</th>
                        <th>deviceId</th>
                        <th>failureReason</th>
                        <th>createdAt</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.content.map((item) => {
                        const failed = (item.status ?? "").toUpperCase().includes("FAIL");
                        return (
                            <tr key={item.id} className={failed ? "table-danger" : ""}>
                                <td>{item.id}</td>
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
                    {data.content.length === 0 && !loading && (
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
