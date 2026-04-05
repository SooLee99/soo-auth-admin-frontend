import {useMemo} from "react";
import type {HealthComponent, HealthSnapshot} from "../../types/auth-service";

type Props = {
    data: HealthSnapshot | null;
    title?: string;
    showRaw?: boolean;
    showLinks?: boolean;
};

function formatBytes(bytes?: number): string {
    if (typeof bytes !== "number" || !Number.isFinite(bytes)) return "-";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let idx = 0;

    while (value >= 1024 && idx < units.length - 1) {
        value /= 1024;
        idx += 1;
    }

    return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function formatUptime(sec?: number): string {
    if (typeof sec !== "number" || !Number.isFinite(sec)) return "-";
    const day = Math.floor(sec / 86400);
    const hour = Math.floor((sec % 86400) / 3600);
    const min = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (day > 0) return `${day}일 ${hour}시간 ${min}분`;
    if (hour > 0) return `${hour}시간 ${min}분 ${s}초`;
    if (min > 0) return `${min}분 ${s}초`;
    return `${s}초`;
}

function usagePercent(used?: number, total?: number): number {
    if (typeof used !== "number" || typeof total !== "number" || total <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((used / total) * 100)));
}

function formatNumber(value?: number): string {
    if (typeof value !== "number" || !Number.isFinite(value)) return "-";
    return new Intl.NumberFormat("ko-KR").format(value);
}

export default function HealthSummary({data: snapshot, title = "서버 상태", showRaw = true, showLinks = true}: Props) {
    const heapUsed = snapshot?.system?.jvm?.heapUsedBytes;
    const heapMax = snapshot?.system?.jvm?.heapMaxBytes;
    const heapPercent = usagePercent(heapUsed, heapMax);

    const diskTotal = snapshot?.system?.disk?.totalBytes;
    const diskUsable = snapshot?.system?.disk?.usableBytes;
    const diskUsed = typeof diskTotal === "number" && typeof diskUsable === "number" ? Math.max(diskTotal - diskUsable, 0) : undefined;
    const diskPercent = usagePercent(diskUsed, diskTotal);

    const components = useMemo(() => Object.entries(snapshot?.components ?? {}), [snapshot?.components]);
    const links = useMemo(() => Object.entries(snapshot?.links ?? {}), [snapshot?.links]);

    const upComponents = components.filter(([, c]) => c && (c as HealthComponent).status === "UP").length;
    const downComponents = components.length - upComponents;
    const maxLatency = components.reduce((max, [, c]) => {
        const latency = (c && typeof c.latencyMs === "number") ? c.latencyMs : 0;
        return Math.max(max, latency);
    }, 0);

    if (!snapshot) {
        return <div className="alert alert-warning py-2">서버 응답 형식을 파싱할 수 없습니다.</div>;
    }

    return (
        <div className="health-summary">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0">{title}</h6>
                <span className={`badge ${snapshot.status === "UP" ? "text-bg-success" : "text-bg-danger"}`}>
                    {snapshot.status ?? "UNKNOWN"}
                </span>
            </div>

            <div className="health-metrics-grid mb-2">
                <div className="health-metric-card">
                    <div className="health-metric-label">애플리케이션</div>
                    <div className="health-metric-value">{snapshot.application ?? "-"}</div>
                </div>
                <div className="health-metric-card">
                    <div className="health-metric-label">실행 시간</div>
                    <div className="health-metric-value">{formatUptime(snapshot.uptimeSec)}</div>
                    <div className="health-metric-sub">{formatNumber(snapshot.uptimeSec)} sec</div>
                </div>
                <div className="health-metric-card">
                    <div className="health-metric-label">CPU 코어</div>
                    <div className="health-metric-value">{snapshot.system?.jvm?.processors ?? "-"}</div>
                </div>
                <div className="health-metric-card">
                    <div className="health-metric-label">컴포넌트</div>
                    <div className="health-metric-value">UP {upComponents} / DOWN {downComponents}</div>
                    <div className="health-metric-sub">최대 지연 {maxLatency} ms</div>
                </div>
            </div>

            <div className="row g-2 mb-2">
                <div className="col-12">
                    <div className="health-kv-card">
                        <div className="health-kv-label">활성 프로필</div>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                            {(snapshot.profiles ?? []).length > 0 ? (
                                snapshot.profiles?.map((profile) => (
                                    <span key={profile} className="badge text-bg-light border">{profile}</span>
                                ))
                            ) : (
                                <span className="health-kv-value">-</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-2 mb-2">
                <div className="col-12 col-md-6">
                    <div className="health-panel">
                        <div className="health-panel-title">JVM Heap</div>
                        <div className="health-meter">
                            <div className="health-meter-fill" style={{width: `${heapPercent}%`}}/>
                        </div>
                        <div className="small text-muted mt-1">
                            사용량 {formatBytes(heapUsed)} / 최대 {formatBytes(heapMax)} ({heapPercent}%)
                        </div>
                        <div className="small text-muted">heapUsedBytes: {formatNumber(heapUsed)}</div>
                        <div className="small text-muted">heapMaxBytes: {formatNumber(heapMax)}</div>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="health-panel">
                        <div className="health-panel-title">Disk Usage</div>
                        <div className="health-meter">
                            <div className="health-meter-fill disk" style={{width: `${diskPercent}%`}}/>
                        </div>
                        <div className="small text-muted mt-1">
                            사용량 {formatBytes(diskUsed)} / 전체 {formatBytes(diskTotal)} ({diskPercent}%)
                        </div>
                        <div className="small text-muted">usableBytes: {formatBytes(diskUsable)}</div>
                        <div className="small text-muted">totalBytes: {formatBytes(diskTotal)}</div>
                    </div>
                </div>
            </div>

            <div className="health-panel mb-2">
                <div className="health-panel-title mb-2">컴포넌트 상태</div>
                {components.length === 0 && <div className="small text-muted">컴포넌트 정보 없음</div>}
                {components.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-sm mb-0">
                            <thead>
                            <tr>
                                <th>name</th>
                                <th>status</th>
                                <th>latency</th>
                            </tr>
                            </thead>
                            <tbody>
                            {components.map(([name, component]) => (
                                <tr key={name}>
                                    <td>{name}</td>
                                    <td>
                                        <span className={`badge ${component?.status === "UP" ? "text-bg-success" : "text-bg-danger"}`}>
                                            {component?.status ?? "UNKNOWN"}
                                        </span>
                                    </td>
                                    <td>{typeof component?.latencyMs === "number" ? `${component.latencyMs} ms` : "-"}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showLinks && links.length > 0 && (
                <div className="health-panel mb-2">
                    <div className="health-panel-title mb-2">운영 링크</div>
                    <div className="row g-2">
                        {links.map(([groupName, groupLinks]) => (
                            <div className="col-12 col-md-4" key={groupName}>
                                <div className="health-link-group h-100">
                                    <div className="health-link-group-title">{groupName}</div>
                                    <div className="d-grid gap-1 mt-2">
                                        {Object.entries((groupLinks as Record<string, string>) ?? {}).map(([label, url]) => (
                                            <a key={`${groupName}-${label}`} className="btn btn-outline-primary btn-sm text-start" href={url}
                                               target="_blank" rel="noreferrer">
                                                {label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showRaw && (
                <details>
                    <summary className="small text-muted">원본 JSON 보기</summary>
                    <pre className="bg-light p-2 border rounded mt-2 mb-0" style={{maxHeight: "280px", overflow: "auto"}}>
                        {JSON.stringify(snapshot, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
}
