-- Nakraku Stash Database Schema: Migration 001_init.sql

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#10B981',
    icon TEXT DEFAULT 'workspace',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    window_count INTEGER NOT NULL DEFAULT 0,
    ram_saved_bytes INTEGER NOT NULL DEFAULT 0,
    is_frozen INTEGER NOT NULL DEFAULT 1,
    snapshot_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS windows (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    hwnd TEXT NOT NULL,
    process_id INTEGER NOT NULL,
    process_name TEXT NOT NULL,
    executable_path TEXT,
    title TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    is_minimized INTEGER NOT NULL DEFAULT 0,
    is_maximized INTEGER NOT NULL DEFAULT 0,
    ram_bytes INTEGER NOT NULL DEFAULT 0,
    z_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tabs (
    id TEXT PRIMARY KEY NOT NULL,
    window_id TEXT NOT NULL REFERENCES windows(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    fav_icon_url TEXT,
    tab_index INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_workspace ON sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_windows_session ON windows(session_id);
CREATE INDEX IF NOT EXISTS idx_tabs_window ON tabs(window_id);
CREATE INDEX IF NOT EXISTS idx_tabs_session ON tabs(session_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_order ON workspaces(sort_order);

INSERT OR IGNORE INTO workspaces (id, name, color, icon, sort_order, is_active, created_at, updated_at)
VALUES ('default', 'General', '#10B981', 'workspace', 0, 1, 0, 0);
