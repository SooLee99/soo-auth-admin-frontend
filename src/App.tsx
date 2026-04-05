import {useCallback, useEffect, useMemo, useState} from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Routes from "./components/routes/Routes";
import RouteContext from "./components/RouteContext";
import AppLayout from "./components/AppLayout";
import AuthWrapper from "./components/AuthWrapper";

const App = () => {
    const [sidebarVisible, setSidebarVisible] = useState(true);

    useEffect(() => {
        let initialized = false;
        const onResize = () => {
            const mobile = window.innerWidth < 1100;
            if (!initialized) {
                initialized = true;
                setSidebarVisible(!mobile);
                return;
            }
            if (mobile) setSidebarVisible(false);
        };
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarVisible((prev) => !prev);
    }, []);

    const layout = useMemo(() => <AppLayout isSidebarVisible={sidebarVisible}/>, [sidebarVisible]);
    const routes = useMemo(() => Routes({layout, toggleSidebar}), [layout, toggleSidebar]);

    const router = useMemo(
        () =>
            createBrowserRouter([
                {
                    element: <AuthWrapper/>,
                    children: routes,
                },
            ]),
        [routes]
    );

    return (
        <RouteContext.Provider value={{routes, router}}>
            <RouterProvider router={router}/>
        </RouteContext.Provider>
    );
};

export default App;
