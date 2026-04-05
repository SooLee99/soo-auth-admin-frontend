import {useEffect, useMemo, useState} from "react";
import AdminPage from "../../components/admin/AdminPage";
import {getHealth, getLoginHistory} from "../../lib/auth-service/client";
import type {HealthSnapshot, LoginHistoryItem} from "../../types/auth-service";
import HealthSummary from "../../components/admin/HealthSummary";

type Props = {
    toggleSidebar?: () => void;
};

type HourlyStat = {
    hour: string;
    total: number;
    fail: number;
};


function buildHourlyStats(items: LoginHistoryItem[]): HourlyStat[] {
    const map = new Map<string, HourlyStat>();

    for (let h = 0; h < 24; h += 1) {
        const key = String(h).padStart(2, "0");
        map.set(key, {hour: key, total: 0, fail: 0});
    }

    items.forEach((item) => {
        if (!item.createdAt) return;
        const d = new Date(item.createdAt);
        if (Number.isNaN(d.getTime())) return;

        const hour = String(d.getHours()).padStart(2, "0");
        const stat = map.get(hour);
        if (!stat) return;

        stat.total += 1;
        if ((item.status ?? "").toUpperCase().includes("FAIL")) {
            stat.fail += 1;
        }
    });

    return Array.from(map.values());
}


export default function DashboardPage({toggleSidebar}: Props) {
    const [healthText, setHealthText] = useState("확인 전");
    const [healthRaw, setHealthRaw] = useState<HealthSnapshot | null>(null);
    const [checkedAt, setCheckedAt] = useState("-");
    const [history, setHistory] = useState<LoginHistoryItem[]>([]);

    useEffect(() => {
        void loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            const [health, loginHistory] = await Promise.all([
                getHealth(),
                getLoginHistory({page: 0, size: 500, sort: "createdAt,desc"}),
            ]);

            setHealthText("정상 응답");
            setHealthRaw(health);
            setHistory(loginHistory.content ?? []);
        } catch (e) {
            setHealthText(e instanceof Error ? e.message : "조회 실패");
            setHealthRaw(null);
        } finally {
            setCheckedAt(new Date().toLocaleString());
        }
    }

    const hourlyStats = useMemo(() => buildHourlyStats(history), [history]);
    const maxTotal = useMemo(() => Math.max(...hourlyStats.map((v) => v.total), 1), [hourlyStats]);

    const dashboardLinks = useMemo(() => {
        if (!healthRaw?.links) return [];
        return Object.entries(healthRaw.links);
    }, [healthRaw]);

    return (
        <AdminPage
            title="대시보드"
            toggleSidebar={toggleSidebar}
            actions={<button className="btn btn-outline-secondary btn-sm" onClick={() => void loadDashboardData()}>새로고침</button>}
        >
            <div className="row g-3 mb-4">
                <div className="col-12 col-xl-6">
                    <div className="card p-3 h-100">
                        <div className="small text-muted mb-2">최근 조회: {checkedAt}</div>
                        <div className="small text-muted mb-2">조회 상태: {healthText}</div>
                        {Boolean(healthRaw) && <HealthSummary data={healthRaw} title="현재 서버 정보" showRaw={false} showLinks={false}/>}
                        <div className="small text-muted mt-3">API Base URL: {(import.meta.env.VITE_API_BASE_URL ?? "(동일 오리진)").toString()}</div>
                        <div className="small text-muted">브라우저 시간: {new Date().toLocaleString()}</div>
                    </div>
                </div>

                <div className="col-12 col-xl-6">
                    <div className="card p-3 h-100">
                        <h6 className="mb-2">운영 링크</h6>
                        {dashboardLinks.length === 0 && <div className="small text-muted">노출할 운영 링크가 없습니다.</div>}
                        {dashboardLinks.length > 0 && (
                            <div className="row g-2">
                                {dashboardLinks.map(([groupName, groupLinks]) => (
                                    <div className="col-12 col-md-4" key={groupName}>
                                        <div className="health-link-group h-100">
                                            <div className="health-link-group-title">{groupName}</div>
                                            <div className="d-grid gap-1 mt-2">
                                                {Object.entries(groupLinks ?? {}).map(([label, url]) => (
                                                    <a
                                                        key={`${groupName}-${label}`}
                                                        className="btn btn-outline-primary btn-sm text-start"
                                                        href={url as string}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {label}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12">
                    <div className="card p-3 h-100">
                        <h6>사용자 접속 시간대 통계 (최근 조회 분량)</h6>
                        <div className="small text-muted mb-2">
                            기준 데이터: 로그인 이력 {history.length}건
                        </div>
                        <div className="hourly-chart-vertical">
                            {hourlyStats.map((stat) => {
                                const ratio = Math.round((stat.total / maxTotal) * 100);
                                return (
                                    <div key={stat.hour} className="hourly-chart-col">
                                        <div className="hourly-chart-value">{stat.total}</div>
                                        <div className="hourly-chart-bar-wrap-vertical">
                                            <div className="hourly-chart-bar-vertical" style={{height: `${ratio}%`}}/>
                                        </div>
                                        <div className="hourly-chart-label">{stat.hour}</div>
                                        <div className="hourly-chart-fail">실패 {stat.fail}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminPage>
    );
}
