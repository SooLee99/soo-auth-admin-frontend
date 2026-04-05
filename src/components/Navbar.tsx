import * as BsIcons from "react-icons/bs";

interface ContentProps {
    toggleSidebar?: () => void;
}


export function Navbar({toggleSidebar}: ContentProps) {
    if (toggleSidebar) {
        return (
            <div className="navbar d-flex flex-wrap pb-3">
                <button type="button" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                        onClick={toggleSidebar} aria-label="사이드바 토글">
                    <BsIcons.BsList size="17"/>
                    메뉴
                </button>
            </div>
        );
    }

    return <></>;
}
