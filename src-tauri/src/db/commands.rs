use super::backup::backup_db;
use super::session_repo::{self, CreateSessionInput, SessionRecord};
use super::settings_repo;
use super::tab_repo::{self, InsertTabInput, TabRecord};
use super::window_repo::{self, InsertWindowInput, WindowRecord};
use super::workspace_repo::{self, CreateWorkspaceInput, WorkspaceRecord};
use super::{DbError, DbPool};
use tauri::{AppHandle, State};

#[tauri::command]
pub fn create_workspace(
    pool: State<DbPool>,
    input: CreateWorkspaceInput,
) -> Result<WorkspaceRecord, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    workspace_repo::create(&conn, input)
}

#[tauri::command]
pub fn list_workspaces(pool: State<DbPool>) -> Result<Vec<WorkspaceRecord>, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    workspace_repo::list(&conn)
}

#[tauri::command]
pub fn get_workspace(pool: State<DbPool>, id: String) -> Result<WorkspaceRecord, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    workspace_repo::get(&conn, &id)
}

#[tauri::command]
pub fn rename_workspace(
    pool: State<DbPool>,
    id: String,
    new_name: String,
) -> Result<WorkspaceRecord, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    workspace_repo::rename(&conn, &id, &new_name)
}

#[tauri::command]
pub fn update_workspace_color(
    pool: State<DbPool>,
    id: String,
    color: String,
) -> Result<WorkspaceRecord, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    workspace_repo::update_color(&conn, &id, &color)
}

#[tauri::command]
pub fn delete_workspace(pool: State<DbPool>, id: String) -> Result<bool, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    workspace_repo::delete(&conn, &id)
}

#[tauri::command]
pub fn reorder_workspaces(pool: State<DbPool>, ids: Vec<String>) -> Result<(), DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    workspace_repo::reorder(&conn, &ids)
}

#[tauri::command]
pub fn save_session(
    pool: State<DbPool>,
    input: CreateSessionInput,
) -> Result<SessionRecord, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    session_repo::save_session(&conn, input)
}

#[tauri::command]
pub fn list_sessions(
    pool: State<DbPool>,
    workspace_id: String,
) -> Result<Vec<SessionRecord>, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    session_repo::list_sessions(&conn, &workspace_id)
}

#[tauri::command]
pub fn get_session(pool: State<DbPool>, id: String) -> Result<SessionRecord, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    session_repo::get_session(&conn, &id)
}

#[tauri::command]
pub fn delete_session(pool: State<DbPool>, id: String) -> Result<bool, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    session_repo::delete_session(&conn, &id)
}

#[tauri::command]
pub fn save_session_windows(
    pool: State<DbPool>,
    windows: Vec<InsertWindowInput>,
    tabs: Vec<InsertTabInput>,
) -> Result<(), DbError> {
    let mut conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    window_repo::upsert_windows(&mut conn, &windows)?;
    tab_repo::upsert_tabs(&mut conn, &tabs)?;
    Ok(())
}

#[tauri::command]
pub fn get_session_windows(
    pool: State<DbPool>,
    session_id: String,
) -> Result<Vec<WindowRecord>, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    window_repo::list_by_session(&conn, &session_id)
}

#[tauri::command]
pub fn get_window_tabs(
    pool: State<DbPool>,
    window_id: String,
) -> Result<Vec<TabRecord>, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    tab_repo::list_by_window(&conn, &window_id)
}

#[tauri::command]
pub fn get_setting(pool: State<DbPool>, key: String) -> Result<Option<String>, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    settings_repo::get_setting(&conn, &key)
}

#[tauri::command]
pub fn set_setting(pool: State<DbPool>, key: String, value: String) -> Result<(), DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    settings_repo::set_setting(&conn, &key, &value)
}

#[tauri::command]
pub fn backup_database(app: AppHandle) -> Result<String, DbError> {
    backup_db(&app)
}

#[tauri::command]
pub fn get_database_path(app: AppHandle) -> Result<String, DbError> {
    let path = super::get_db_path(&app).map_err(DbError::Io)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn purge_all_sessions(pool: State<DbPool>) -> Result<usize, DbError> {
    let conn = pool.lock().map_err(|_| DbError::Poisoned)?;
    session_repo::purge_all_sessions(&conn)
}
