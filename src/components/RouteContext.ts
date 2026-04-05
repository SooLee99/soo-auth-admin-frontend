import {createContext} from "react";
import {ServiceRouteObject} from "./routes/Routes.tsx";
import type {createBrowserRouter} from "react-router-dom";


type BrowserRouterType = ReturnType<typeof createBrowserRouter>;

interface RouteContextProps {
    routes: ServiceRouteObject[];
    router: BrowserRouterType
}

const RouteContext = createContext<RouteContextProps | null>(null);

export default RouteContext;