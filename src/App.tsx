import { useCallback, useEffect, useState } from "react";
import AppRouter from "./routes/AppRouter";

export default function App(): JSX.Element {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    const onResize = (): void => {
      setSidebarVisible(window.innerWidth >= 1100);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

  return <AppRouter sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} />;
}
