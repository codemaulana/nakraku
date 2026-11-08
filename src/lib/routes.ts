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

/**
 * Type guard verifying whether an arbitrary value matches a registered AppRoute.
 * @param {unknown} value Candidate value to test.
 * @returns {value is AppRoute} True if value is a valid AppRoute.
 */
export const isAppRoute = (value: unknown): value is AppRoute => {
  return typeof value === "string" && ROUTE_LOOKUP.has(value as AppRoute);
};

/**
 * Resolves metadata configuration for a specific route.
 * @param {AppRoute} route Route identifier.
 * @returns {RouteConfig} Route metadata object.
 */
export const getRouteConfig = (route: AppRoute): RouteConfig => {
  const config = ROUTE_LOOKUP.get(route);
  if (!config) {
    return ROUTE_LOOKUP.get(DEFAULT_ROUTE)!;
  }
  return config;
};

/**
 * Serializes an AppRoute into a URL hash fragment.
 * @param {AppRoute} route Route identifier.
 * @returns {string} Hash fragment string (e.g. '#/dashboard').
 */
export const routeToHash = (route: AppRoute): string => {
  return `#/${route}`;
};

/**
 * Parses a window location hash fragment into an AppRoute.
 * @param {string} hash Raw hash string from location.hash.
 * @returns {AppRoute} Matched AppRoute or DEFAULT_ROUTE fallback.
 */
export const hashToRoute = (hash: string): AppRoute => {
  const clean = hash.replace(/^#\/?/u, "").split("?")[0].toLowerCase();
  return isAppRoute(clean) ? clean : DEFAULT_ROUTE;
};
