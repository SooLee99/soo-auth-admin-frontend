import {useState} from "react";
import AdminPage from "../../components/admin/AdminPage";
import {getHealth} from "../../lib/auth-service/client";
import HealthSummary from "../../components/admin/HealthSummary";
import type {HealthSnapshot} from "../../types/auth-service";

type Props = {
    toggleSidebar?: () => void;
};

export default function HealthPage({toggleSidebar}: Props) {
    const [status, setStatus] = useState<"IDLE" | "OK" | "FAIL">("IDLE");
    const [lastCheckedAt, setLastCheckedAt] = useState("");
    const [raw, setRaw] = useState<HealthSnapshot | null>(null);

    async function onCheck() {
        try {
            const data = await getHealth();
            setStatus("OK");
            setRaw(data);
        } catch {
            setStatus("FAIL");
            setRaw(null);
        } finally {
            setLastCheckedAt(new Date().toLocaleString());
        }
    }

    return (
        <AdminPage title="헬스 체크" toggleSidebar={toggleSidebar}>
            <div className="d-flex align-items-center gap-2 mb-3">
                <span className={`badge ${status === "OK" ? "text-bg-success" : status === "FAIL" ? "text-bg-danger" : "text-bg-secondary"}`}>
                    {status}
                </span>
                <span className="small text-muted">최근 확인: {lastCheckedAt || "-"}</span>
                <button className="btn btn-primary btn-sm" onClick={() => void onCheck()}>수동 재조회</button>
            </div>

            {raw ? <HealthSummary data={raw} title="헬스 체크 상세"/> : (
                <div className="alert alert-secondary py-2">아직 조회하지 않았습니다.</div>
            )}
        </AdminPage>
    );
}
