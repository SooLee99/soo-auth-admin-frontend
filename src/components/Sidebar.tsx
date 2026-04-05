import {MouseEvent, useCallback, useContext, useState} from "react";
import {Link, matchPath, useLocation} from "react-router-dom";
import "../static/css/sidebar.css";
import {IconContext} from "react-icons";
import {ServiceRouteObject} from "./routes/Routes.tsx";
import RouteContext from "../components/RouteContext";
import LogoutActionButton from "./admin/LogoutActionButton";

interface SidebarProps {
    isSidebarVisible: boolean;
}

function isRouteActive(pathname: string, routePath: string | undefined): boolean {
    if (!routePath) return false;
    return Boolean(matchPath(routePath, pathname));
}

function SidebarChildMenu({className, children, activeChildPath}: { className: string, children?: ServiceRouteObject[], activeChildPath?: string }) {
    const onClickChildMenu = useCallback((e: MouseEvent, path: string | undefined) => {
        if (!path) {
            e.preventDefault();
        }
    }, []);


    return (
        <div className={`sublist ${className}`}>
            <div className="bottom_line_purple"></div>
            <ul>
                {children?.map((child) => {
                    return (
                        <li key={child.title} className={`nav-sub-text ${child.className ?? ''}`.trim()}>
                            <Link
                                to={child.path!}
                                className={child.path === activeChildPath ? 'on' : ''}
                                target={child.target}
                                onClick={e => onClickChildMenu(e, child.path)}
                            >
                                {child.title}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

function SidebarRootMenu({item}: { item: ServiceRouteObject }) {
    const location = useLocation();
    const allChildren = item.children ?? [];
    const visibleChildren = allChildren.filter((child) => child.exposeSidebar);
    const selectedChildPath = visibleChildren.find((child) => isRouteActive(location.pathname, child.path))?.path;

    const subIndex = allChildren.findIndex((child) => isRouteActive(location.pathname, child.path));
    const [activeSubMenu, setActiveSubmenu] = useState(subIndex > -1);
    const onClickTopMenu = useCallback((e: MouseEvent, path: string | undefined) => {
        if (!path) {
            e.preventDefault();
        }

        setActiveSubmenu(active => !active);
    }, []);

    const hasSelectedChild = subIndex > -1;

    const hasChildren = visibleChildren.length > 0;
    const rootSelected = isRouteActive(location.pathname, item.path);
    const selectedClass = hasSelectedChild || rootSelected ? 'on' : '';

    return (
        <li key={item.title} className={`nav-text ${item.className ?? ''} ${selectedClass}`}>
            <Link
                to={item.path!}
                target={item.target}
                onClick={e => onClickTopMenu(e, item.path)}>
                {item.icon ?? ""}
                <h6 className="pt-2">&ensp;{item.title}</h6>
            </Link>

            {hasChildren && <SidebarChildMenu children={visibleChildren} className={activeSubMenu ? 'on' : ''} activeChildPath={selectedChildPath}/>}
        </li>
    );
}

const Sidebar = ({isSidebarVisible}: SidebarProps) => {
    const routeCtx = useContext(RouteContext);
    if (!routeCtx) return;

    const routes = routeCtx.routes
        .filter(route => route.exposeSidebar)
        .filter(route => route.children)
        .flatMap(route => route.children!)
    ;

    return (
        <>
            <IconContext.Provider value={{color: "undefined"}}>
                <nav className={isSidebarVisible ? "nav-menu visible" : "nav-menu hidden"}>
                    <div className="sidebar-layout">
                        {/* LOGO */}
                        <div>
                            <ul className="nav-menu-items pt-2 list-unstyled">
                                {routes.map((route, index) => <SidebarRootMenu key={index} item={route}/>)}
                            </ul>
                        </div>
                        <div className="sidebar-quick-actions">
                            <p className="small text-muted mb-2">관리자 빠른 작업</p>
                            <LogoutActionButton stacked/>
                        </div>
                    </div>
                </nav>
            </IconContext.Provider>
        </>
    );
}

export default Sidebar;
