import { vi } from "vitest";

if (typeof window !== "undefined") {
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

  class MockResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  window.ResizeObserver = window.ResizeObserver || MockResizeObserver;

  const internals = {
    metadata: {
      currentWindow: { label: "main" },
    },
    transformCallback: (cb: unknown) => cb,
    invoke: vi.fn().mockResolvedValue(undefined),
  };

  Object.defineProperty(window, "__TAURI_INTERNALS__", {
    value: internals,
    writable: true,
  });
}

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn().mockResolvedValue(false),
    onResized: vi.fn().mockResolvedValue(() => {}),
  }),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
  emit: vi.fn().mockResolvedValue(undefined),
}));
