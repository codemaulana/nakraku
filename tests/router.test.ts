import { describe, it, expect } from "vitest";
import {
  isAppRoute,
  getRouteConfig,
  routeToHash,
  hashToRoute,
  DEFAULT_ROUTE,
  APP_ROUTES,
} from "../src/lib/routes";
import { fuzzySearchCommands, APP_SHORTCUTS } from "../src/lib/shortcuts";
import { getStoredRoute, setStoredRoute } from "../src/router/Router";

describe("Phase 3 - Routes System", () => {
  it("recognizes valid application routes", () => {
    expect(isAppRoute("dashboard")).toBe(true);
    expect(isAppRoute("workspaces")).toBe(true);
    expect(isAppRoute("active-session")).toBe(true);
    expect(isAppRoute("settings")).toBe(true);
    expect(isAppRoute("about")).toBe(true);
    expect(isAppRoute("gallery")).toBe(true);
    expect(isAppRoute("invalid-route")).toBe(false);
  });

  it("returns correct route config for route id", () => {
    const config = getRouteConfig("dashboard");
    expect(config.label).toBe("Dashboard");
    expect(config.path).toBe("#/dashboard");
    expect(config.showInSidebar).toBe(true);
  });

  it("falls back to default route on unknown route", () => {
    // @ts-expect-error testing invalid route fallback
    const fallback = getRouteConfig("unknown");
    expect(fallback.id).toBe(DEFAULT_ROUTE);
  });

  it("converts route to hash and vice versa", () => {
    expect(routeToHash("workspaces")).toBe("#/workspaces");
    expect(hashToRoute("#/workspaces")).toBe("workspaces");
    expect(hashToRoute("#/settings?tab=general")).toBe("settings");
    expect(hashToRoute("#/non-existent")).toBe(DEFAULT_ROUTE);
  });

  it("verifies all registered routes have labels and paths", () => {
    expect(APP_ROUTES.length).toBeGreaterThanOrEqual(6);
    for (const route of APP_ROUTES) {
      expect(route.label.length).toBeGreaterThan(0);
      expect(route.path.startsWith("#/")).toBe(true);
    }
  });
});

describe("Phase 3 - Shortcuts & Command Palette", () => {
  it("contains core desktop shortcut definitions", () => {
    expect(APP_SHORTCUTS.length).toBeGreaterThanOrEqual(10);
  });

  it("performs fuzzy search on commands", () => {
    const stashResults = fuzzySearchCommands("stash");
    expect(stashResults.length).toBeGreaterThan(0);
    expect(stashResults.some((s) => s.id === "cmd-stash-all")).toBe(true);

    const navResults = fuzzySearchCommands("workspaces");
    expect(navResults.some((s) => s.route === "workspaces")).toBe(true);

    const shortcutResults = fuzzySearchCommands("ctrl+k");
    expect(shortcutResults.some((s) => s.id === "cmd-palette")).toBe(true);
  });
});

describe("Phase 3 - Route State Persistence", () => {
  it("handles route persistence safely", () => {
    setStoredRoute("settings");
    expect(getStoredRoute()).toBeDefined();
  });
});
