import {createContext} from "react";
import {type AdminInfoData} from "../lib/ModelTypes.ts";


export interface AuthWrapperContextProps {
    isAuthenticated: boolean;
    userInfo: AdminInfoData;
    invalidate(): Promise<void>;
}

const AuthWrapperContext = createContext<AuthWrapperContextProps | null>(null);
export default AuthWrapperContext;