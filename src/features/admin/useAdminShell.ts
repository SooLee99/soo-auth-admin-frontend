import { useLayoutContext } from "../../layouts/useLayoutContext";

export function useAdminShell(): { toggleSidebar: () => void } {
  const { toggleSidebar } = useLayoutContext();
  return { toggleSidebar };
}
