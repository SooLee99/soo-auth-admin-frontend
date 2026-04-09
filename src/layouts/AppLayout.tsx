import { Outlet, useMatches } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import { useLayoutContext } from "./useLayoutContext";

type Handle = { standalone?: boolean };

export default function AppLayout(): JSX.Element {
  const { sidebarVisible } = useLayoutContext();
  const matches = useMatches();
  const current = matches[matches.length - 1];
  const standalone = ((current?.handle as Handle | undefined)?.standalone ?? false);

  if (standalone) {
    return <Outlet />;
  }

  return (
    <>
      <Sidebar />
      <div className={`app-shell-content ${sidebarVisible ? "with-sidebar" : "without-sidebar"}`}>
        <Outlet />
      </div>
    </>
  );
}
