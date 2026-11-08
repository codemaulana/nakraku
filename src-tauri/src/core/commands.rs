use super::auto_snapshot::execute_auto_snapshot;
use super::session_diff::diff_sessions;
use super::stash_service::{quick_switch, restore_workspace, stash_now, undo_last_operation};
use super::types::{ConflictResolutionMode, QuickSwitchResult, RestoreResult, SessionDiff, StashResult, UndoItem};
use super::undo_stack::UndoStack;
use super::workspace_manager::{check_workspace_limit, validate_workspace_name};
use crate::db::workspace_repo::{self, CreateWorkspaceInput, WorkspaceRecord};
use crate::db::DbPool;
use crate::os::types::{RawWindow, WindowRect};
use crate::os::window_enum::enumerate_windows;
use tauri::State;

#[tauri::command]
pub fn cmd_stash_now(
    pool: State<'_, DbPool>,
    undo_stack: State<'_, UndoStack>,
    workspace_id: String,
    session_name: String,
) -> Result<StashResult, String> {
    stash_now(&pool, &undo_stack, &workspace_id, &session_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_restore_workspace(
    pool: State<'_, DbPool>,
    undo_stack: State<'_, UndoStack>,
    workspace_id: String,
) -> Result<RestoreResult, String> {
    restore_workspace(
        &pool,
        &undo_stack,
        &workspace_id,
        ConflictResolutionMode::OverwritePosition,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_quick_switch(
    pool: State<'_, DbPool>,
    undo_stack: State<'_, UndoStack>,
    from_workspace_id: String,
    to_workspace_id: String,
) -> Result<QuickSwitchResult, String> {
    quick_switch(&pool, &undo_stack, &from_workspace_id, &to_workspace_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_undo_last_operation(
    pool: State<'_, DbPool>,
    undo_stack: State<'_, UndoStack>,
) -> Result<UndoItem, String> {
    undo_last_operation(&pool, &undo_stack).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_get_undo_stack_size(undo_stack: State<'_, UndoStack>) -> Result<usize, String> {
    Ok(undo_stack.len())
}

#[tauri::command]
pub fn cmd_create_workspace_validated(
    pool: State<'_, DbPool>,
    name: String,
    color: Option<String>,
    icon: Option<String>,
) -> Result<WorkspaceRecord, String> {
    let conn = pool
        .lock()
        .map_err(|e| format!("Lock acquisition error: {e}"))?;

    check_workspace_limit(&conn).map_err(|e| e.to_string())?;

    let existing = workspace_repo::list(&conn)
        .map_err(|e| format!("Database error: {e}"))?;
    let existing_names: Vec<String> = existing.into_iter().map(|w| w.name).collect();

    let valid_name = validate_workspace_name(&name, &existing_names)
        .map_err(|e| e.to_string())?;

    let id = format!("ws_{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0));

    let new_ws = CreateWorkspaceInput {
        id: id.clone(),
        name: valid_name,
        color,
        icon,
    };

    workspace_repo::create(&conn, new_ws).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_diff_live_with_session(
    pool: State<'_, DbPool>,
    session_id: String,
) -> Result<SessionDiff, String> {
    let live_windows = enumerate_windows().map_err(|e| e.to_string())?;

    let conn = pool
        .lock()
        .map_err(|e| format!("Lock acquisition error: {e}"))?;

    let db_windows = crate::db::window_repo::list_by_session(&conn, &session_id)
        .map_err(|e| e.to_string())?;

    let session_windows: Vec<RawWindow> = db_windows
        .into_iter()
        .map(|w| {
            let clean_hex = w.hwnd.trim_start_matches("0x").trim_start_matches("0X");
            let hwnd_val = usize::from_str_radix(clean_hex, 16).unwrap_or(0);

            RawWindow {
                hwnd: w.hwnd,
                hwnd_val,
                title: w.title,
                class_name: String::new(),
                process_id: w.process_id as u32,
                process_name: w.process_name,
                exe_path: w.executable_path,
                rect: WindowRect {
                    x: w.x,
                    y: w.y,
                    width: w.width as i32,
                    height: w.height as i32,
                },
                is_visible: true,
                is_minimized: w.is_minimized,
                is_maximized: w.is_maximized,
                ram_bytes: w.ram_bytes as u64,
                is_elevated: false,
                z_order: w.z_order,
                icon_base64: None,
            }
        })
        .collect();

    Ok(diff_sessions(&session_windows, &live_windows))
}

#[tauri::command]
pub fn cmd_trigger_auto_snapshot(
    pool: State<'_, DbPool>,
    workspace_id: String,
) -> Result<String, String> {
    execute_auto_snapshot(&pool, &workspace_id).map_err(|e| e.to_string())
}
