type Props = {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props): JSX.Element {
  const maxPage = Math.max(totalPages - 1, 0);
  return (
    <div className="d-flex align-items-center gap-2 mt-3">
      <button className="btn btn-outline-secondary btn-sm" disabled={page <= 0} onClick={() => onPageChange(0)}>처음</button>
      <button className="btn btn-outline-secondary btn-sm" disabled={page <= 0} onClick={() => onPageChange(Math.max(page - 1, 0))}>이전</button>
      <span className="small text-muted">{totalPages === 0 ? "0 / 0" : `${page + 1} / ${totalPages}`}</span>
      <button className="btn btn-outline-secondary btn-sm" disabled={page >= maxPage || totalPages === 0} onClick={() => onPageChange(Math.min(page + 1, maxPage))}>다음</button>
      <button className="btn btn-outline-secondary btn-sm" disabled={page >= maxPage || totalPages === 0} onClick={() => onPageChange(maxPage)}>마지막</button>
    </div>
  );
}
