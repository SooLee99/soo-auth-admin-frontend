import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "../features/auth/AuthContext";
import LayoutContext from "../layouts/LayoutContext";
import { appRoutes, sidebarItems } from "./routeConfig";

type Props = {
  sidebarVisible: boolean;
  toggleSidebar: () => void;
};

export default function AppRouter({ sidebarVisible, toggleSidebar }: Props): JSX.Element {
  const router = useMemo(() => createBrowserRouter(appRoutes), []);

  return (
    <AuthProvider>
      <LayoutContext.Provider value={{ sidebarItems, sidebarVisible, toggleSidebar }}>
        <RouterProvider router={router} />
      </LayoutContext.Provider>
    </AuthProvider>
  );
}
