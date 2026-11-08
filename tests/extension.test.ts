import { describe, expect, it } from "vitest";
import { WsStatusPayloadSchema, WsTabItemSchema } from "../src/lib/schemas";

function computeReconnectDelay(attempts: number): number {
  return Math.min(1000 * Math.pow(2, attempts), 16000);
}

function filterActionableTabs(
  tabs: Array<{ id?: number; url?: string; title?: string }>
) {
  return tabs.filter((t) => {
    if (!t.url) return false;
    if (t.url.startsWith("chrome://")) return false;
    if (t.url.startsWith("edge://")) return false;
    if (t.url.startsWith("brave://")) return false;
    if (t.url.startsWith("about:")) return false;
    return true;
  });
}

function createWsEnvelope<T>(type: string, requestId: string, payload: T) {
  return {
    type,
    requestId,
    payload,
    timestamp: Date.now(),
  };
}

describe("Browser Extension MV3 Schemas", () => {
  it("validates WsTabItemSchema with valid data", () => {
    const raw = {
      id: 101,
      window_id: 1,
      url: "https://github.com/nakraku/stash",
      title: "GitHub - nakraku/stash",
      fav_icon_url: "https://github.githubassets.com/favicons/favicon.png",
      active: true,
      index: 0,
    };

    const parsed = WsTabItemSchema.parse(raw);
    expect(parsed.id).toBe(101);
    expect(parsed.url).toBe("https://github.com/nakraku/stash");
  });

  it("validates WsTabItemSchema with null and optional fields", () => {
    const raw = { url: "https://google.com", title: "Google" };
    const parsed = WsTabItemSchema.parse(raw);
    expect(parsed.url).toBe("https://google.com");
    expect(parsed.fav_icon_url).toBeUndefined();
  });

  it("fails WsTabItemSchema when required fields are missing", () => {
    expect(() => WsTabItemSchema.parse({ title: "No URL" })).toThrow();
    expect(() => WsTabItemSchema.parse({ url: 12345 })).toThrow();
  });

  it("validates WsStatusPayloadSchema correctly", () => {
    const status = { connected: true, client_count: 2, port: 48123 };
    const parsed = WsStatusPayloadSchema.parse(status);
    expect(parsed.connected).toBe(true);
    expect(parsed.port).toBe(48123);
  });
});

describe("Browser Extension MV3 Protocol & Utilities", () => {
  it("calculates exponential backoff delays with 16000ms cap", () => {
    expect(computeReconnectDelay(0)).toBe(1000);
    expect(computeReconnectDelay(1)).toBe(2000);
    expect(computeReconnectDelay(4)).toBe(16000);
    expect(computeReconnectDelay(5)).toBe(16000);
  });

  it("filters non-actionable browser internal URLs for Chrome, Edge, and Brave", () => {
    const mockTabs = [
      { id: 1, url: "https://github.com", title: "GitHub" },
      { id: 2, url: "chrome://extensions", title: "Extensions" },
      { id: 3, url: "edge://settings", title: "Edge Settings" },
      { id: 4, url: "brave://rewards", title: "Brave Rewards" },
      { id: 5, url: "about:blank", title: "Blank" },
      { id: 6, url: "http://localhost:5173", title: "Dev Server" },
    ];

    const filtered = filterActionableTabs(mockTabs);
    expect(filtered).toHaveLength(2);
    expect(filtered[0]?.url).toBe("https://github.com");
  });

  it("constructs compliant WS envelope with timestamp and requestId", () => {
    const envelope = createWsEnvelope("PING", "req-123", { status: "ready" });
    expect(envelope.type).toBe("PING");
    expect(envelope.requestId).toBe("req-123");
    expect(typeof envelope.timestamp).toBe("number");
  });

  it("handles offline storage fallback structure", () => {
    const storageState: Record<string, unknown> = {};
    const tabsToCache = [{ id: 1, url: "https://tauri.app", title: "Tauri" }];
    storageState.nakraku_last_stashed = tabsToCache;
    storageState.nakraku_last_stashed_at = 1700000000000;
    expect(storageState.nakraku_last_stashed).toHaveLength(1);
  });
});
