import {type ReactNode} from "react";
import {Navbar} from "../Navbar";

type AdminPageProps = {
    title: string;
    toggleSidebar?: () => void;
    actions?: ReactNode;
    children: ReactNode;
};

export default function AdminPage({title, toggleSidebar, actions, children}: AdminPageProps) {
    return (
        <main className="admin-page container-fluid py-3">
            <Navbar toggleSidebar={toggleSidebar}/>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="mb-0">{title}</h4>
                <div className="d-flex align-items-center gap-2">{actions}</div>
            </div>
            {children}
        </main>
    );
}
