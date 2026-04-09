import { createContext } from "react";
import type { SidebarItem } from "../routes/types";

export type LayoutContextValue = {
  sidebarItems: SidebarItem[];
  sidebarVisible: boolean;
  toggleSidebar: () => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export default LayoutContext;
