import type { PropsWithChildren, ReactNode } from "react";
import Topbar from "../navigation/Topbar";

type Props = PropsWithChildren<{
  title: string;
  actions?: ReactNode;
  onToggleSidebar?: () => void;
}>;

export default function PageFrame({ title, actions, onToggleSidebar, children }: Props): JSX.Element {
  return (
    <main className="container-fluid py-3">
      <Topbar onToggleSidebar={onToggleSidebar} />
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">{title}</h4>
        <div className="d-flex align-items-center gap-2">{actions}</div>
      </div>
      {children}
    </main>
  );
}
