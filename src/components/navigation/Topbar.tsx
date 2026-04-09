import { BsList } from "react-icons/bs";

type Props = {
  onToggleSidebar?: () => void;
};

export default function Topbar({ onToggleSidebar }: Props): JSX.Element {
  if (!onToggleSidebar) return <></>;

  return (
    <div className="navbar d-flex flex-wrap pb-3">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
        onClick={onToggleSidebar}
        aria-label="사이드바 토글"
      >
        <BsList size={17} />
        메뉴
      </button>
    </div>
  );
}
