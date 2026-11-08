export type AppRoute =
  | "dashboard"
  | "workspaces"
  | "active-session"
  | "minimap"
  | "settings"
  | "about"
  | "gallery";

export interface RouteConfig {
  id: AppRoute;
  label: string;
  path: string;
  icon: string;
  shortcut?: string;
  showInSidebar: boolean;
  badge?: string | number;
}

export const APP_ROUTES: readonly RouteConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "#/dashboard",
    icon: "window",
    shortcut: "Alt+1",
    showInSidebar: true,
    badge: "14",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    path: "#/workspaces",
    icon: "workspace",
    shortcut: "Alt+2",
    showInSidebar: true,
    badge: "3",
  },
  {
    id: "active-session",
    label: "Active Session",
    path: "#/session",
    icon: "restore",
    shortcut: "Alt+3",
    showInSidebar: true,
  },
  {
    id: "minimap",
    label: "Spatial Minimap",
    path: "#/minimap",
    icon: "monitor",
    shortcut: "Alt+4",
    showInSidebar: true,
  },
  {
    id: "settings",
    label: "Settings",
    path: "#/settings",
    icon: "settings",
    shortcut: "Alt+,",
    showInSidebar: true,
  },
  {
    id: "about",
    label: "About Nakraku",
    path: "#/about",
    icon: "info",
    shortcut: "Alt+/",
    showInSidebar: true,
  },
  {
    id: "gallery",
    label: "Component QA",
    path: "#/gallery",
    icon: "search",
    shortcut: "Alt+G",
    showInSidebar: true,
    badge: "DEV",
  },
] as const;

export const DEFAULT_ROUTE: AppRoute = "dashboard";

const ROUTE_LOOKUP = new Map<AppRoute, RouteConfig>(
  APP_ROUTES.map((route) => [route.id, route])
);

export const isAppRoute = (value: unknown): value is AppRoute => {
  return typeof value === "string" && ROUTE_LOOKUP.has(value as AppRoute);
};

export const getRouteConfig = (route: AppRoute): RouteConfig => {
  const config = ROUTE_LOOKUP.get(route);
  if (!config) {
    return ROUTE_LOOKUP.get(DEFAULT_ROUTE)!;
  }
  return config;
};

export const routeToHash = (route: AppRoute): string => {
  return `#/${route}`;
};

export const hashToRoute = (hash: string): AppRoute => {
  const clean = hash.replace(/^#\/?/u, "").split("?")[0].toLowerCase();
  return isAppRoute(clean) ? clean : DEFAULT_ROUTE;
};
