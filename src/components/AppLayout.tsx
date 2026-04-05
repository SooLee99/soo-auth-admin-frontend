import Sidebar from "./Sidebar.tsx";
import {Outlet, useMatches} from "react-router-dom";


interface AppLayoutProps {
    isSidebarVisible: boolean;
}


function AppLayout({isSidebarVisible}: AppLayoutProps) {
    const matches = useMatches();
    const currentHandle = matches[matches.length - 1]?.handle as { standalone?: boolean };
    const standalone = currentHandle?.standalone ?? false;


    if (standalone) {
        return (
            <>
                <Outlet/>
            </>
        );
    }

    return (
        <>
            <Sidebar isSidebarVisible={isSidebarVisible}/>
            <div className={`app-shell-content ${isSidebarVisible ? "with-sidebar" : "without-sidebar"}`}>
                <Outlet/>
            </div>
        </>
    );
}

export default AppLayout;
