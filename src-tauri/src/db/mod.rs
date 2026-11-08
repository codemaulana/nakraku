pub mod backup;
pub mod commands;
pub mod session_repo;
pub mod settings_repo;
pub mod tab_repo;
pub mod window_repo;
pub mod workspace_repo;

use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager};

pub type DbPool = Arc<Mutex<Connection>>;

const MIGRATION_001_INIT: &str = include_str!("../../migrations/001_init.sql");
const MIGRATION_002_SETTINGS: &str = include_str!("../../migrations/002_settings.sql");

#[derive(Debug)]
pub enum DbError {
    Sqlite(rusqlite::Error),
    Poisoned,
    Io(String),
    NotFound(String),
    Validation(String),
}

impl std::fmt::Display for DbError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(e) => write!(f, "SQLite database error: {}", e),
            Self::Poisoned => write!(f, "Database lock poisoned"),
            Self::Io(e) => write!(f, "IO error: {}", e),
            Self::NotFound(e) => write!(f, "Not found: {}", e),
            Self::Validation(e) => write!(f, "Validation error: {}", e),
        }
    }
}

impl std::error::Error for DbError {}

impl From<rusqlite::Error> for DbError {
    fn from(err: rusqlite::Error) -> Self {
        Self::Sqlite(err)
    }
}

impl serde::Serialize for DbError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub fn get_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app data dir: {}", e))?;
    Ok(app_dir.join("stash.db"))
}

pub fn init_connection(conn: &mut Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA foreign_keys = ON;
         PRAGMA busy_timeout = 5000;
         PRAGMA temp_store = MEMORY;
         PRAGMA mmap_size = 268435456;
         PRAGMA cache_size = -64000;
         PRAGMA wal_autocheckpoint = 1000;",
    )?;
    Ok(())
}

pub fn run_migrations(conn: &mut Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY NOT NULL,
            applied_at INTEGER NOT NULL
        );",
    )?;

    let applied_versions: Vec<i32> = {
        let mut stmt = conn.prepare("SELECT version FROM schema_migrations ORDER BY version ASC")?;
        let versions = stmt
            .query_map([], |row| row.get(0))?
            .filter_map(Result::ok)
            .collect();
        versions
    };

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    if !applied_versions.contains(&1) {
        let tx = conn.transaction()?;
        tx.execute_batch(MIGRATION_001_INIT)?;
        tx.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (1, ?1)",
            [now],
        )?;
        tx.commit()?;
    }

    if !applied_versions.contains(&2) {
        let tx = conn.transaction()?;
        tx.execute_batch(MIGRATION_002_SETTINGS)?;
        tx.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (2, ?1)",
            [now],
        )?;
        tx.commit()?;
    }

    Ok(())
}

pub fn setup_db(app: &AppHandle) -> Result<DbPool, String> {
    let path = get_db_path(app)?;
    let mut conn = Connection::open(&path)
        .map_err(|e| format!("Failed to open SQLite database at {:?}: {}", path, e))?;

    init_connection(&mut conn)
        .map_err(|e| format!("Failed to configure SQLite PRAGMAs: {}", e))?;

    run_migrations(&mut conn)
        .map_err(|e| format!("Failed to execute SQLite migrations: {}", e))?;

    Ok(Arc::new(Mutex::new(conn)))
}
