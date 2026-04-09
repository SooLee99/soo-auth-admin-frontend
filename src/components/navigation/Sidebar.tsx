import { Link, useLocation } from "react-router-dom";
import { useLayoutContext } from "../../layouts/useLayoutContext";
import "../../static/css/sidebar.css";
import { useAuth } from "../../features/auth/useAuth";

type NodeProps = {
  label: string;
  path?: string;
  children?: NodeProps[];
};

function SidebarNode({ label, path, children }: NodeProps): JSX.Element {
  const location = useLocation();
  const hasChildren = Boolean(children && children.length > 0);
  const selected = path ? location.pathname === path || location.pathname.startsWith(`${path}/`) : false;

  return (
    <li className={`nav-text ${selected ? "on" : ""}`}>
      {path ? <Link to={path}><h6 className="pt-2">{label}</h6></Link> : <h6 className="pt-2">{label}</h6>}
      {hasChildren && (
        <div className="sublist on">
          <ul>
            {children?.map((child) => (
              <li key={child.label} className="nav-sub-text">
                {child.path ? <Link to={child.path}>{child.label}</Link> : child.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function Sidebar(): JSX.Element {
  const { sidebarItems, sidebarVisible } = useLayoutContext();
  const { logout } = useAuth();

  return (
    <nav className={sidebarVisible ? "nav-menu visible" : "nav-menu hidden"}>
      <div className="sidebar-layout">
        <ul className="nav-menu-items pt-2 list-unstyled">
          {sidebarItems.map((item) => (
            <SidebarNode key={item.key} label={item.label} path={item.path} children={item.children} />
          ))}
        </ul>
        <div className="sidebar-quick-actions">
          <p className="small text-muted mb-2">관리자 빠른 작업</p>
          <div className="d-grid gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => void logout(false)}>로그아웃</button>
            <button className="btn btn-outline-danger btn-sm" onClick={() => void logout(true)}>전체 로그아웃</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
