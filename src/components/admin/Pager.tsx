type PagerProps = {
    page: number;
    totalPages: number;
    onPageChange: (nextPage: number) => void;
};

export default function Pager({page, totalPages, onPageChange}: PagerProps) {
    const disabledPrev = page <= 0;
    const disabledNext = page + 1 >= totalPages;
    const normalizedTotal = Math.max(totalPages, 0);

    return (
        <div className="d-flex align-items-center gap-2 mt-3">
            <button className="btn btn-outline-secondary btn-sm" disabled={disabledPrev} onClick={() => onPageChange(0)}>
                처음
            </button>
            <button className="btn btn-outline-secondary btn-sm" disabled={disabledPrev} onClick={() => onPageChange(page - 1)}>
                이전
            </button>
            <span className="small text-muted">
                {normalizedTotal === 0 ? "0 / 0" : `${page + 1} / ${normalizedTotal}`}
            </span>
            <button className="btn btn-outline-secondary btn-sm" disabled={disabledNext || normalizedTotal === 0}
                    onClick={() => onPageChange(page + 1)}>
                다음
            </button>
            <button
                className="btn btn-outline-secondary btn-sm"
                disabled={disabledNext || normalizedTotal === 0}
                onClick={() => onPageChange(Math.max(normalizedTotal - 1, 0))}
            >
                마지막
            </button>
        </div>
    );
}
