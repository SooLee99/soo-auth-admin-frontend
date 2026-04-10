import { useEffect, useState } from "react";
import { getHealth, getLoginHistory, getSmsLogs, getSmsStats } from "../../../api/adminApi";
import type { HealthSnapshot, LoginHistoryItem, SmsLogItem, SmsStat } from "../../../types/admin";
import PageFrame from "../../../components/common/PageFrame";
import StatusBadge from "../../../components/common/StatusBadge";
import { useAdminShell } from "../useAdminShell";
import { fmtDateTime } from "../../../utils/format";

function formatNumber(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "-";
  return value.toLocaleString();
}

function formatSeconds(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "-";
  const sec = Math.max(0, Math.floor(value));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatBytes(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "-";
  if (value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = value;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function toPercent(part: number | undefined, total: number | undefined): number {
  if (!part || !total || total <= 0) return 0;
  return Math.max(0, Math.min(100, (part / total) * 100));
}

function valueText(value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "number") return Number.isFinite(value) ? value.toLocaleString() : "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function statEntries(stats: SmsStat | null): Array<[string, unknown]> {
  if (!stats) return [];
  return Object.entries(stats).filter(([, v]) => v === null || ["string", "number", "boolean"].includes(typeof v));
}

function pickValue(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") return record[key];
  }
  return undefined;
}

export default function DashboardPage(): JSX.Element {
  const { toggleSidebar } = useAdminShell();
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [smsStats, setSmsStats] = useState<SmsStat | null>(null);
  const [smsLogs, setSmsLogs] = useState<SmsLogItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setError("");
    try {
      const [healthRes, historyRes, smsStatsRes, smsLogsRes] = await Promise.all([
        getHealth(),
        getLoginHistory({ page: 0, size: 20, sort: "createdAt,desc" }),
        getSmsStats(),
        getSmsLogs({ page: 0, size: 10 }),
      ]);
      setHealth(healthRes);
      setHistory(historyRes.content);
      setSmsStats(smsStatsRes);
      setSmsLogs(smsLogsRes.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "대시보드 조회에 실패했습니다.");
    }
  }

  return (
    <PageFrame title="대시보드" onToggleSidebar={toggleSidebar} actions={<button className="btn btn-outline-secondary btn-sm" onClick={() => void load()}>새로고침</button>}>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="row g-3 health-summary">
        <div className="col-12">
          <div className="card p-3">
            <h6 className="mb-3">헬스 요약</h6>
            <div className="health-metrics-grid">
              <div className="health-metric-card">
                <div className="health-metric-label">Status</div>
                <div className="health-metric-value mt-1"><StatusBadge value={health?.status} /></div>
              </div>
              <div className="health-metric-card">
                <div className="health-metric-label">Application</div>
                <div className="health-metric-value">{health?.application ?? "-"}</div>
              </div>
              <div className="health-metric-card">
                <div className="health-metric-label">Version</div>
                <div className="health-metric-value">{health?.version ?? "-"}</div>
              </div>
              <div className="health-metric-card">
                <div className="health-metric-label">Profiles</div>
                <div className="health-metric-value">{health?.profiles?.join(", ") || "-"}</div>
              </div>
              <div className="health-kv-card">
                <div className="health-kv-label">Started At</div>
                <div className="health-kv-value">{fmtDateTime(health?.startedAt)}</div>
              </div>
              <div className="health-kv-card">
                <div className="health-kv-label">Uptime</div>
                <div className="health-kv-value">{formatSeconds(health?.uptimeSec)}</div>
              </div>
              <div className="health-kv-card">
                <div className="health-kv-label">Build Version</div>
                <div className="health-kv-value">{health?.build?.version ?? "-"}</div>
              </div>
              <div className="health-kv-card">
                <div className="health-kv-label">Git Branch / Commit</div>
                <div className="health-kv-value">{health?.build?.gitBranch ?? "-"} / {health?.build?.gitCommitId ?? "-"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card p-3 h-100">
            <h6 className="mb-3">컴포넌트 상태</h6>
            <div className="d-flex flex-column gap-2">
              <div className="health-panel">
                <div className="health-panel-title mb-2">Database</div>
                <div className="d-flex align-items-center gap-2 mb-2"><StatusBadge value={health?.components?.database?.status} /></div>
                <div className="small text-muted">Latency: {formatNumber(health?.components?.database?.latencyMs)} ms</div>
                <div className="small text-muted">Product: {String(health?.components?.database?.product ?? "-")}</div>
                <div className="small text-muted">Version: {String(health?.components?.database?.version ?? "-")}</div>
                <div className="small text-muted">Driver: {String(health?.components?.database?.driver ?? "-")}</div>
                <div className="small text-muted text-truncate">URL: {String(health?.components?.database?.url ?? "-")}</div>
                <div className="small text-muted mt-1">
                  Pool: active {formatNumber(health?.components?.database?.pool?.activeConnections)}, idle {formatNumber(health?.components?.database?.pool?.idleConnections)}, waiting {formatNumber(health?.components?.database?.pool?.threadsAwaitingConnection)}, total {formatNumber(health?.components?.database?.pool?.totalConnections)}
                </div>
              </div>

              <div className="health-panel">
                <div className="health-panel-title mb-2">Redis</div>
                <div className="d-flex align-items-center gap-2 mb-2"><StatusBadge value={health?.components?.redis?.status} /></div>
                <div className="small text-muted">Latency: {formatNumber(health?.components?.redis?.latencyMs)} ms</div>
              </div>

              <div className="health-panel">
                <div className="health-panel-title mb-2">Monitoring</div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <StatusBadge value={health?.components?.monitoring?.status} />
                </div>
                <div className="d-flex flex-column gap-2">
                  {Object.entries(health?.components?.monitoring?.targets ?? {}).map(([name, target]) => (
                    <div key={name} className="border rounded p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="small text-capitalize">{name}</strong>
                        <StatusBadge value={target?.status} />
                      </div>
                      <div className="small text-muted">HTTP: {formatNumber(target?.httpStatus)}</div>
                      <div className="small text-muted">Latency: {formatNumber(target?.latencyMs)} ms</div>
                      <div className="small text-muted text-truncate">URL: {target?.url ?? "-"}</div>
                      <div className="small text-danger">Error: {target?.error ?? "-"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card p-3 h-100">
            <h6 className="mb-3">시스템 / 링크</h6>
            <div className="d-flex flex-column gap-2">
              <div className="health-panel">
                <div className="health-panel-title">JVM</div>
                <div className="small text-muted mt-1">
                  Heap: {formatBytes(health?.system?.jvm?.heapUsedBytes)} / {formatBytes(health?.system?.jvm?.heapMaxBytes)} ({toPercent(health?.system?.jvm?.heapUsedBytes, health?.system?.jvm?.heapMaxBytes).toFixed(1)}%)
                </div>
                <div className="health-meter">
                  <div className="health-meter-fill" style={{ width: `${toPercent(health?.system?.jvm?.heapUsedBytes, health?.system?.jvm?.heapMaxBytes)}%` }} />
                </div>
                <div className="small text-muted mt-2">Processors: {formatNumber(health?.system?.jvm?.processors)}</div>
              </div>

              <div className="health-panel">
                <div className="health-panel-title">Disk</div>
                <div className="small text-muted mt-1">
                  Usable: {formatBytes(health?.system?.disk?.usableBytes)} / {formatBytes(health?.system?.disk?.totalBytes)}
                </div>
                <div className="health-meter">
                  <div className="health-meter-fill disk" style={{ width: `${100 - toPercent(health?.system?.disk?.usableBytes, health?.system?.disk?.totalBytes)}%` }} />
                </div>
              </div>

              {Object.entries(health?.links ?? {}).map(([groupName, groupLinks]) => (
                <div key={groupName} className="health-link-group">
                  <div className="health-link-group-title mb-2 text-capitalize">{groupName}</div>
                  <div className="d-flex flex-column gap-1">
                    {Object.entries(groupLinks ?? {}).map(([key, url]) => (
                      <a key={key} className="small text-break" href={url} target="_blank" rel="noreferrer">
                        {key}: {url}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card p-3">
            <h6 className="mb-3">SMS 대시보드</h6>
            <div className="health-metrics-grid mb-3">
              {statEntries(smsStats).length === 0 && (
                <div className="health-kv-card">
                  <div className="health-kv-label">통계</div>
                  <div className="health-kv-value">-</div>
                </div>
              )}
              {statEntries(smsStats).slice(0, 8).map(([key, value]) => (
                <div key={key} className="health-kv-card">
                  <div className="health-kv-label">{key}</div>
                  <div className="health-kv-value">{valueText(value)}</div>
                </div>
              ))}
            </div>
            <div className="small text-muted mb-2">최근 SMS 로그 {smsLogs.length}건</div>
            <ul className="small mb-0">
              {smsLogs.slice(0, 5).map((item, index) => {
                const row = item as Record<string, unknown>;
                const to = valueText(pickValue(row, ["to", "smsTo"]));
                const provider = valueText(pickValue(row, ["provider"]));
                const ok = pickValue(row, ["ok"]);
                const status = typeof ok === "boolean" ? (ok ? "UP" : "DOWN") : valueText(pickValue(row, ["status"]));
                const at = pickValue(row, ["at", "createdAt"]);
                const text = valueText(pickValue(row, ["text", "smsText"]));
                const key = valueText(pickValue(row, ["id"])) !== "-" ? String(pickValue(row, ["id"])) : `${to}-${index}`;
                return (
                  <li key={key}>
                    {to} / {provider} / <StatusBadge value={status} /> / {fmtDateTime(typeof at === "string" ? at : undefined)} / {text}
                  </li>
                );
              })}
              {smsLogs.length === 0 && <li>-</li>}
            </ul>
          </div>
        </div>

        <div className="col-12">
          <div className="card p-3">
            <h6>최근 로그인 이력</h6>
            <div className="small text-muted">최근 {history.length}건</div>
            <ul className="small mb-0 mt-2">
              {history.slice(0, 5).map((item) => (
                <li key={item.id}>{item.userEmail ?? item.userId ?? "-"} / {item.status ?? "-"}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
