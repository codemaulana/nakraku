import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      bg: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        hover: "var(--bg-hover)",
        active: "var(--bg-active)",
      },
      border: {
        subtle: "var(--border-subtle)",
        muted: "var(--border-muted)",
        focus: "var(--border-focus)",
        danger: "var(--border-color-danger)",
        warning: "var(--border-color-warning)",
      },
      accent: {
        emerald: "var(--accent-emerald)",
        "emerald-hover": "var(--accent-emerald-hover)",
        "emerald-muted": "var(--accent-emerald-muted)",
      },
      text: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        disabled: "var(--text-disabled)",
        mono: "var(--text-mono)",
      },
      status: {
        active: "var(--status-active)",
        frozen: "var(--status-frozen)",
        warning: "var(--status-warning)",
        danger: "var(--status-danger)",
      },
      danger: {
        DEFAULT: "var(--danger)",
        muted: "var(--danger-muted)",
      },
      warning: {
        DEFAULT: "var(--warning)",
        muted: "var(--warning-muted)",
      },
    },
    extend: {
      fontFamily: {
        ui: ["var(--font-ui)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "2xs": ["var(--text-2xs)", { lineHeight: "var(--leading-compact)" }],
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-compact)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-compact)" }],
        md: ["var(--text-md)", { lineHeight: "var(--leading-compact)" }],
        base: ["var(--text-base)", { lineHeight: "var(--leading-normal)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-normal)" }],
      },
      lineHeight: {
        none: "var(--leading-none)",
        compact: "var(--leading-compact)",
        normal: "var(--leading-normal)",
      },
      letterSpacing: {
        tight: "var(--tracking-tight)",
        normal: "var(--tracking-normal)",
        wide: "var(--tracking-wide)",
      },
      spacing: {
        titlebar: "var(--titlebar-height)",
        statusbar: "var(--statusbar-height)",
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-collapsed-width)",
        "row-sm": "var(--row-height-sm)",
        row: "var(--row-height)",
        "row-lg": "var(--row-height-lg)",
        "3xs": "var(--gap-3xs)",
        "2xs": "var(--gap-2xs)",
        xs: "var(--gap-xs)",
        sm: "var(--gap-sm)",
        md: "var(--gap-md)",
        base: "var(--gap-base)",
        lg: "var(--gap-lg)",
      },
      height: {
        titlebar: "var(--titlebar-height)",
        statusbar: "var(--statusbar-height)",
        "row-sm": "var(--row-height-sm)",
        row: "var(--row-height)",
        "row-lg": "var(--row-height-lg)",
      },
      width: {
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-collapsed-width)",
      },
      borderRadius: {
        none: "var(--radius-none)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      borderWidth: {
        DEFAULT: "var(--border-width)",
        thick: "var(--border-width-thick)",
      },
    },
  },
  plugins: [],
};

export default config;
