import type { RouteObject } from "react-router-dom";

export type RouteMeta = {
  title?: string;
  sidebar?: boolean;
  icon?: string;
  standalone?: boolean;
};

export type AppRouteObject = RouteObject & {
  meta?: RouteMeta;
  children?: AppRouteObject[];
};

export type SidebarItem = {
  key: string;
  label: string;
  path?: string;
  icon?: string;
  children?: SidebarItem[];
};
