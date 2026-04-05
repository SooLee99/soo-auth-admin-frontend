export function fmtDateTime(v?: string | null): string {
    if (!v) return "-";
    try {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return v;
        return d.toLocaleString();
    } catch {
        return v;
    }
}
export function boolish(v: unknown): boolean {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    if (typeof v === "string") return v === "true" || v === "1";
    return false;
}

export function numberish(v: unknown): number {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }
    if (typeof v === "boolean") return v ? 1 : 0;
    return 0;
}