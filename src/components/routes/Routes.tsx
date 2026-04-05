import {RouteObject, Navigate} from "react-router-dom";
import * as BsIcons from "react-icons/bs";
import {frontBaseUrl, loginPageUrl} from "../../build_constants";
import LoginPage from "../../pages/admin/LoginPage";
import DashboardPage from "../../pages/admin/DashboardPage";
import LoginHistoryPage from "../../pages/admin/LoginHistoryPage";
import BlockedUsersPage from "../../pages/admin/BlockedUsersPage";
import DeletedUsersPage from "../../pages/admin/DeletedUsersPage";
import UserStatusAuditsPage from "../../pages/admin/UserStatusAuditsPage";
import UserLoginHistoryPage from "../../pages/admin/UserLoginHistoryPage";
import AuthToolsPage from "../../pages/admin/AuthToolsPage";
import HealthPage from "../../pages/admin/HealthPage";
import UserDetailPage from "../../pages/admin/UserDetailPage";
import UsersPage from "../../pages/admin/UsersPage";
import SmsPage from "../../pages/admin/SmsPage";

export type ServiceRouteObject = {
    handle?: {
        authRequire?: boolean;
        standalone?: boolean;
    };
    title?: string;
    icon?: JSX.Element;
    children?: ServiceRouteObject[];
    exposeSidebar?: boolean;
    className?: string;
    target?: string;
} & RouteObject;

interface RoutesProps {
    layout: JSX.Element;
    toggleSidebar: () => void;
}

const Routes = ({layout, toggleSidebar}: RoutesProps): ServiceRouteObject[] => {
    const adminRoutes: ServiceRouteObject = {
        exposeSidebar: true,
        element: layout,
        children: [
            {
                exposeSidebar: true,
                title: "대시보드",
                path: `${frontBaseUrl}/`,
                element: <DashboardPage toggleSidebar={toggleSidebar}/>,
                icon: <BsIcons.BsHouseDoorFill/>,
            },
            {
                exposeSidebar: true,
                title: "로그인 이력",
                path: `${frontBaseUrl}/login-history`,
                element: <LoginHistoryPage toggleSidebar={toggleSidebar}/>,
                icon: <BsIcons.BsClockHistory/>,
            },
            {
                exposeSidebar: true,
                title: "문자 관리",
                path: `${frontBaseUrl}/sms`,
                element: <SmsPage toggleSidebar={toggleSidebar}/>,
                icon: <BsIcons.BsChatLeftDotsFill/>,
            },
            {
                exposeSidebar: true,
                title: "사용자 관리",
                icon: <BsIcons.BsPeople/>,
                children: [
                    {
                        exposeSidebar: true,
                        title: "전체 사용자",
                        path: `${frontBaseUrl}/users`,
                        element: <UsersPage toggleSidebar={toggleSidebar}/>,
                    },
                    {
                        exposeSidebar: true,
                        title: "차단 사용자",
                        path: `${frontBaseUrl}/users/blocked`,
                        element: <BlockedUsersPage toggleSidebar={toggleSidebar}/>,
                    },
                    {
                        exposeSidebar: true,
                        title: "탈퇴 사용자",
                        path: `${frontBaseUrl}/users/deleted`,
                        element: <DeletedUsersPage toggleSidebar={toggleSidebar}/>,
                    },
                    {
                        exposeSidebar: false,
                        title: "사용자 상세",
                        path: `${frontBaseUrl}/users/:userId`,
                        element: <UserDetailPage toggleSidebar={toggleSidebar}/>,
                    },
                    {
                        exposeSidebar: false,
                        title: "사용자 수정",
                        path: `${frontBaseUrl}/users/:userId/edit`,
                        element: <UserDetailPage toggleSidebar={toggleSidebar}/>,
                    },
                    {
                        exposeSidebar: false,
                        title: "상태 변경 이력",
                        path: `${frontBaseUrl}/users/:userId/status-audits`,
                        element: <UserStatusAuditsPage toggleSidebar={toggleSidebar}/>,
                    },
                    {
                        exposeSidebar: false,
                        title: "로그인 이력",
                        path: `${frontBaseUrl}/users/:userId/login-history`,
                        element: <UserLoginHistoryPage toggleSidebar={toggleSidebar}/>,
                    },
                ],
            },
            {
                exposeSidebar: true,
                title: "인증 테스트 도구",
                path: `${frontBaseUrl}/tools/auth`,
                element: <AuthToolsPage toggleSidebar={toggleSidebar}/>,
                icon: <BsIcons.BsTools/>,
            },
            {
                exposeSidebar: true,
                title: "시스템",
                icon: <BsIcons.BsHddNetwork/>,
                children: [
                    {
                        exposeSidebar: true,
                        title: "헬스 체크",
                        path: `${frontBaseUrl}/system/health`,
                        element: <HealthPage toggleSidebar={toggleSidebar}/>,
                    },
                ],
            },
        ],
    };

    const publicRoutes: ServiceRouteObject = {
        children: [
            {
                handle: {authRequire: false, standalone: true},
                path: loginPageUrl,
                element: <LoginPage/>,
            },
            {
                handle: {authRequire: false},
                path: "*",
                element: <Navigate to={`${frontBaseUrl}/`} replace/>,
            },
        ],
    };

    return [adminRoutes, publicRoutes];
};

export default Routes;
