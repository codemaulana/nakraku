-- Nakraku Stash Database Schema: Migration 002_settings.sql

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
