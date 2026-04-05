import {FormEvent, useEffect, useState} from "react";
import AdminPage from "../../components/admin/AdminPage";
import Pager from "../../components/admin/Pager";
import {getSmsLogs, getSmsStats, sendSms} from "../../lib/auth-service/client";
import type {PageResponse, SmsLogItem, SmsStatsItem} from "../../types/auth-service";
import {fmtDateTime} from "../../utils/format";

type Props = {
    toggleSidebar?: () => void;
};

const EMPTY_LOG_PAGE: PageResponse<SmsLogItem> = {
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

export default function SmsPage({toggleSidebar}: Props) {
    const [logs, setLogs] = useState<PageResponse<SmsLogItem>>(EMPTY_LOG_PAGE);
    const [stats, setStats] = useState<SmsStatsItem | null>(null);
    const [logPage, setLogPage] = useState(0);
    const [logSize, setLogSize] = useState(20);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [to, setTo] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        void loadLogs(logPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logPage, logSize, startDate, endDate]);

    useEffect(() => {
        void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    async function loadLogs(targetPage: number) {
        setLoadingLogs(true);
        setError("");
        try {
            const res = await getSmsLogs({
                page: targetPage,
                size: logSize,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setLogs(res || EMPTY_LOG_PAGE);
        } catch (e) {
            setError(e instanceof Error ? e.message : "문자 발송 이력 조회에 실패했습니다.");
        } finally {
            setLoadingLogs(false);
        }
    }

    async function loadStats() {
        setLoadingStats(true);
        setError("");
        try {
            const res = await getSmsStats({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setStats(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "문자 발송 통계 조회에 실패했습니다.");
        } finally {
            setLoadingStats(false);
        }
    }

    async function onSend(e: FormEvent) {
        e.preventDefault();
        if (!to.trim() || !text.trim()) {
            setError("수신 번호와 내용을 입력해 주세요.");
            return;
        }

        setSending(true);
        setError("");
        setNotice("");
        try {
            await sendSms(to.trim(), text.trim());
            setNotice("문자 발송 요청을 보냈습니다.");
            setTo("");
            setText("");
            await loadLogs(0);
            await loadStats();
        } catch (e) {
            setError(e instanceof Error ? e.message : "문자 발송에 실패했습니다.");
        } finally {
            setSending(false);
        }
    }

    return (
        <AdminPage title="관리자 문자 관리" toggleSidebar={toggleSidebar}>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {notice && <div className="alert alert-success py-2">{notice}</div>}

            <div className="row g-4">
                <div className="col-12 col-xl-4">
                    <div className="card h-100 p-3">
                        <h6>관리자 문자 발송</h6>
                        <form onSubmit={onSend}>
                            <div className="mb-3">
                                <label className="form-label small">수신 번호</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="예: 01012345678"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small">발송 내용</label>
                                <textarea
                                    className="form-control form-control-sm"
                                    rows={4}
                                    placeholder="문자 내용을 입력하세요."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    required
                                />
                            </div>
                            <button className="btn btn-primary btn-sm w-100" type="submit" disabled={sending}>
                                {sending ? "발송 중..." : "문자 발송"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-12 col-xl-8">
                    <div className="card h-100 p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">문자 발송 통계</h6>
                            <div className="d-flex gap-2">
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className="align-self-center">~</span>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {loadingStats ? (
                            <div className="text-muted small">통계 로딩 중...</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered text-center align-middle mb-0">
                                    <thead className="table-light">
                                    <tr className="small">
                                        <th>총 발송</th>
                                        <th>성공</th>
                                        <th>실패</th>
                                        <th>성공률</th>
                                    </tr>
                                    </thead>
                                    <tbody className="small">
                                    {stats ? (
                                        <tr>
                                            <td>{stats.total}</td>
                                            <td className="text-success">{stats.ok}</td>
                                            <td className="text-danger">{stats.fail}</td>
                                            <td>{stats.rate}%</td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-muted py-3">통계 데이터가 없습니다.</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-12">
                    <div className="card p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">문자 발송 이력</h6>
                            <div className="d-flex gap-2 align-items-center">
                                <span className="small text-muted">페이지 크기</span>
                                <select
                                    className="form-select form-select-sm"
                                    style={{width: "80px"}}
                                    value={logSize}
                                    onChange={(e) => setLogSize(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>

                        {loadingLogs && <div className="text-muted small mb-2">이력 로딩 중...</div>}
                        <div className="table-responsive">
                            <table className="table table-sm table-hover text-center align-middle mb-0">
                                <thead className="table-light">
                                <tr className="small">
                                    <th>ID</th>
                                    <th>수신 번호</th>
                                    <th style={{width: "40%"}}>내용</th>
                                    <th>성공 여부</th>
                                    <th>발신 일시</th>
                                    <th>오류 코드 / 메시지</th>
                                </tr>
                                </thead>
                                <tbody className="small">
                                {logs.content.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.to}</td>
                                        <td className="text-start text-truncate" style={{maxWidth: "200px"}} title={item.text}>
                                            {item.text}
                                        </td>
                                        <td>
                                            <span className={`badge ${item.ok ? "text-bg-success" : "text-bg-danger"}`}>
                                                {item.ok ? "SUCCESS" : "FAILURE"}
                                            </span>
                                        </td>
                                        <td>{fmtDateTime(item.at)}</td>
                                        <td className="text-danger small">
                                            {item.code ? `[${item.code}] ` : ""}{item.msg ?? "-"}
                                        </td>
                                    </tr>
                                ))}
                                {logs.content.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-muted py-3">발송 이력이 없습니다.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <Pager
                            page={logs.number ?? logPage}
                            totalPages={logs.totalPages ?? 0}
                            onPageChange={setLogPage}
                        />
                    </div>
                </div>
            </div>
        </AdminPage>
    );
}
