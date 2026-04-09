import PageFrame from "../../../components/common/PageFrame";
import { useAdminShell } from "../useAdminShell";

type Props = {
  title: string;
  reason: string;
};

export default function UnsupportedPage({ title, reason }: Props): JSX.Element {
  const { toggleSidebar } = useAdminShell();

  return (
    <PageFrame title={title} onToggleSidebar={toggleSidebar}>
      <div className="alert alert-warning py-2">미지원 기능</div>
      <p className="small text-muted mb-0">{reason}</p>
    </PageFrame>
  );
}
