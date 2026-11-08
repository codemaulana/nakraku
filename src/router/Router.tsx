import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type AppRoute,
  DEFAULT_ROUTE,
  hashToRoute,
  isAppRoute,
  routeToHash,
} from "../lib/routes";

export interface RouterContextValue {
  currentRoute: AppRoute;
  navigate: (target: AppRoute) => void;
  canGoBack: boolean;
  goBack: () => void;
}

const STORAGE_KEY = "nakraku_last_route";

export const getStoredRoute = (): AppRoute => {
  if (typeof window === "undefined") return DEFAULT_ROUTE;
  try {
    const hash = window.location.hash;
    if (hash && hash.length > 2) {
      const parsed = hashToRoute(hash);
      if (isAppRoute(parsed)) return parsed;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isAppRoute(stored)) {
      return stored;
    }
  } catch {
    return DEFAULT_ROUTE;
  }
  return DEFAULT_ROUTE;
};

export const setStoredRoute = (route: AppRoute): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, route);
  } catch {
    // ignore storage quota errors
  }
};

const RouterContext = createContext<RouterContextValue | null>(null);

const useRouterHistory = (initialRoute?: AppRoute) => {
  const [history, setHistory] = useState<AppRoute[]>([
    initialRoute ?? getStoredRoute(),
  ]);

  const navigate = useCallback((target: AppRoute) => {
    setHistory((prev) => (prev[prev.length - 1] === target ? prev : [...prev, target]));
    setStoredRoute(target);
    if (typeof window !== "undefined") {
      window.location.hash = routeToHash(target);
    }
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, prev.length - 1);
      const target = next[next.length - 1];
      setStoredRoute(target);
      if (typeof window !== "undefined") {
        window.location.hash = routeToHash(target);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const target = hashToRoute(window.location.hash);
      setHistory((prev) => (prev[prev.length - 1] === target ? prev : [...prev, target]));
      setStoredRoute(target);
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return { history, navigate, goBack };
};

export interface RouterProviderProps {
  children: React.ReactNode;
  initialRoute?: AppRoute;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({
  children,
  initialRoute,
}) => {
  const { history, navigate, goBack } = useRouterHistory(initialRoute);
  const currentRoute = history[history.length - 1];

  const value = useMemo<RouterContextValue>(
    () => ({
      currentRoute,
      navigate,
      canGoBack: history.length > 1,
      goBack,
    }),
    [currentRoute, navigate, history.length, goBack]
  );

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextValue => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
};
