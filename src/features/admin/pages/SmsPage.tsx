import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSmsLogs, getSmsStats, sendSms } from "../../../api/adminApi";
import Pagination from "../../../components/common/Pagination";
import PageFrame from "../../../components/common/PageFrame";
import StatusBadge from "../../../components/common/StatusBadge";
import type { SmsLogItem, SmsStat } from "../../../types/admin";
import type { PageResponse } from "../../../types/api";
import { fmtDateTime } from "../../../utils/format";
import { useAdminShell } from "../useAdminShell";

const EMPTY_PAGE: PageResponse<SmsLogItem> = {
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

function toIsoDateTime(local: string): string | undefined {
  if (!local) return undefined;
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function valueText(value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "number") return Number.isFinite(value) ? value.toLocaleString() : "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function pickValue(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") return record[key];
  }
  return undefined;
}

export default function SmsPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const [stats, setStats] = useState<SmsStat | null>(null);
  const [logs, setLogs] = useState<PageResponse<SmsLogItem>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const statEntries = useMemo(
    () => Object.entries(stats ?? {}).filter(([, v]) => v === null || ["string", "number", "boolean"].includes(typeof v)),
    [stats]
  );

  const load = useCallback(async (targetPage: number): Promise<void> => {
    setError("");
    const params = {
      startDate: toIsoDateTime(startDate),
      endDate: toIsoDateTime(endDate),
    };

    try {
      const [statsRes, logsRes] = await Promise.all([
        getSmsStats(params),
        getSmsLogs({ page: targetPage, size, ...params }),
      ]);
      setStats(statsRes);
      setLogs(logsRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "SMS 정보를 불러오지 못했습니다.");
    }
  }, [endDate, size, startDate]);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  async function onSearch(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPage(0);
    await load(0);
  }

  async function onSend(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!to.trim() || !text.trim()) {
      setError("수신 번호와 메시지를 입력해 주세요.");
      return;
    }

    setSending(true);
    try {
      const result = await sendSms({ to: to.trim(), text: text.trim() });
      setSuccess(`발송 요청 완료 (id: ${result.id}, provider: ${valueText(result.provider)})`);
      setText("");
      await load(page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "SMS 발송 실패");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageFrame title="SMS" onToggleSidebar={toggleSidebar} actions={<button className="btn btn-outline-secondary btn-sm" onClick={() => void load(page)}>새로고침</button>}>
      <div className="row g-3">
        <div className="col-12">
          <form className="card p-3" onSubmit={onSend}>
            <h6 className="mb-3">SMS 발송</h6>
            <div className="row g-2">
              <div className="col-12 col-lg-4">
                <input
                  className="form-control"
                  placeholder="수신 번호 (to)"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="col-12 col-lg-6">
                <input
                  className="form-control"
                  placeholder="메시지"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <div className="col-12 col-lg-2">
                <button className="btn btn-primary w-100" type="submit" disabled={sending}>
                  {sending ? "발송 중..." : "발송"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="col-12">
          <form className="card p-3" onSubmit={onSearch}>
            <h6 className="mb-3">SMS 통계 / 로그 조회</h6>
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted">시작일시</label>
                <input type="datetime-local" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted">종료일시</label>
                <input type="datetime-local" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="col-12 col-md-2">
                <label className="form-label small text-muted">페이지 크기</label>
                <input type="number" className="form-control" value={size} onChange={(e) => setSize(Number(e.target.value) || 20)} />
              </div>
              <div className="col-12 col-md-2">
                <button className="btn btn-primary w-100" type="submit">조회</button>
              </div>
            </div>
          </form>
        </div>

        {(error || success) && (
          <div className="col-12">
            {error && <div className="alert alert-danger py-2 mb-2">{error}</div>}
            {success && <div className="alert alert-success py-2 mb-0">{success}</div>}
          </div>
        )}

        <div className="col-12">
          <div className="card p-3">
            <h6 className="mb-3">SMS 통계</h6>
            <div className="health-metrics-grid">
              {statEntries.length === 0 && (
                <div className="health-kv-card">
                  <div className="health-kv-label">통계</div>
                  <div className="health-kv-value">-</div>
                </div>
              )}
              {statEntries.map(([key, value]) => (
                <div key={key} className="health-kv-card">
                  <div className="health-kv-label">{key}</div>
                  <div className="health-kv-value">{valueText(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card p-3">
            <h6 className="mb-3">SMS 로그</h6>
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle text-center">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>to</th>
                    <th>from</th>
                    <th>provider</th>
                    <th>ok</th>
                    <th>at</th>
                    <th>text</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.content.map((item, index) => {
                    const row = item as Record<string, unknown>;
                    const id = pickValue(row, ["id"]);
                    const toValue = valueText(pickValue(row, ["to", "smsTo"]));
                    const fromValue = valueText(pickValue(row, ["from", "smsFrom"]));
                    const provider = valueText(pickValue(row, ["provider"]));
                    const ok = pickValue(row, ["ok"]);
                    const status = typeof ok === "boolean" ? (ok ? "UP" : "DOWN") : valueText(pickValue(row, ["status"]));
                    const at = pickValue(row, ["at", "createdAt"]);
                    const smsText = valueText(pickValue(row, ["text", "smsText"]));
                    const key = id !== undefined ? String(id) : `sms-log-${index}`;

                    return (
                      <tr key={key}>
                        <td>{valueText(id)}</td>
                        <td>{toValue}</td>
                        <td>{fromValue}</td>
                        <td>{provider}</td>
                        <td><StatusBadge value={status} /></td>
                        <td>{fmtDateTime(typeof at === "string" ? at : undefined)}</td>
                        <td className="text-start text-break">{smsText}</td>
                      </tr>
                    );
                  })}
                  {logs.content.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-muted">조회된 데이터가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={logs.number} totalPages={logs.totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
