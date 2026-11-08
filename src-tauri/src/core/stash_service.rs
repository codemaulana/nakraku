use super::error::CoreError;
use super::types::{ConflictResolutionMode, QuickSwitchResult, RestoreResult, StashResult, UndoItem};
use super::undo_stack::UndoStack;
use crate::db::session_repo::{self, CreateSessionInput};
use crate::db::window_repo::{self, InsertWindowInput};
use crate::db::DbPool;
use crate::os::types::{RawWindow, WindowRect};
use crate::os::window_restore::{minimize_all_windows, restore_session_windows, restore_window};
use crate::os::window_snapshot::snapshot_session;
use std::time::{SystemTime, UNIX_EPOCH};

pub fn stash_now(
    pool: &DbPool,
    undo_stack: &UndoStack,
    workspace_id: &str,
    session_name: &str,
) -> Result<StashResult, CoreError> {
    let snapshot = snapshot_session().map_err(|e| CoreError::OsError(e.to_string()))?;

    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    let session_id = format!("s_{now_ms}");
    let window_count = snapshot.windows.len() as u32;
    let ram_saved = snapshot.total_ram_saved_bytes;

    let window_hwnds: Vec<String> = snapshot.windows.iter().map(|w| w.hwnd.clone()).collect();

    {
        let mut conn = pool
            .lock()
            .map_err(|e| CoreError::LockError(e.to_string()))?;

        let new_session = CreateSessionInput {
            id: session_id.clone(),
            workspace_id: workspace_id.to_string(),
            name: session_name.to_string(),
            window_count: window_count as i32,
            ram_saved_bytes: ram_saved as i64,
            is_frozen: true,
        };

        session_repo::save_session(&conn, new_session)
            .map_err(|e| CoreError::DbError(e.to_string()))?;

        let new_windows: Vec<InsertWindowInput> = snapshot
            .windows
            .into_iter()
            .enumerate()
            .map(|(idx, w)| InsertWindowInput {
                id: format!("{}_{idx}", session_id),
                session_id: session_id.clone(),
                hwnd: w.hwnd,
                process_id: w.process_id,
                process_name: w.process_name,
                executable_path: w.exe_path,
                title: w.title,
                x: w.rect.x,
                y: w.rect.y,
                width: w.rect.width.max(0) as u32,
                height: w.rect.height.max(0) as u32,
                is_minimized: w.is_minimized,
                is_maximized: w.is_maximized,
                ram_bytes: w.ram_bytes as i64,
                z_order: w.z_order,
            })
            .collect();

        window_repo::upsert_windows(&mut conn, &new_windows)
            .map_err(|e| CoreError::DbError(e.to_string()))?;
    }

    let minimized_count =
        minimize_all_windows().map_err(|e| CoreError::OsError(e.to_string()))?;

    undo_stack.push(UndoItem {
        id: format!("undo_{now_ms}"),
        action_type: "stash".to_string(),
        workspace_id: workspace_id.to_string(),
        session_id: session_id.clone(),
        timestamp: now_ms,
        window_hwnds,
    });

    Ok(StashResult {
        session_id,
        workspace_id: workspace_id.to_string(),
        window_count,
        ram_saved_bytes: ram_saved,
        minimized_count,
    })
}

pub fn restore_workspace(
    pool: &DbPool,
    undo_stack: &UndoStack,
    workspace_id: &str,
    _conflict_mode: ConflictResolutionMode,
) -> Result<RestoreResult, CoreError> {
    let (session_id, raw_windows) = {
        let conn = pool
            .lock()
            .map_err(|e| CoreError::LockError(e.to_string()))?;

        let sessions = session_repo::list_sessions(&conn, workspace_id)
            .map_err(|e| CoreError::DbError(e.to_string()))?;

        let target_session = sessions
            .iter()
            .find(|s| s.is_frozen)
            .or_else(|| sessions.first())
            .ok_or_else(|| {
                CoreError::SessionNotFound(format!("No sessions found for workspace {workspace_id}"))
            })?;

        let db_windows = window_repo::list_by_session(&conn, &target_session.id)
            .map_err(|e| CoreError::DbError(e.to_string()))?;

        let raw: Vec<RawWindow> = db_windows
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
                }
            })
            .collect();

        (target_session.id.clone(), raw)
    };

    let restored_count = raw_windows.len() as u32;
    let window_hwnds: Vec<String> = raw_windows.iter().map(|w| w.hwnd.clone()).collect();

    restore_session_windows(&raw_windows).map_err(|e| CoreError::OsError(e.to_string()))?;

    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    undo_stack.push(UndoItem {
        id: format!("undo_{now_ms}"),
        action_type: "restore".to_string(),
        workspace_id: workspace_id.to_string(),
        session_id: session_id.clone(),
        timestamp: now_ms,
        window_hwnds,
    });

    Ok(RestoreResult {
        session_id,
        workspace_id: workspace_id.to_string(),
        restored_count,
    })
}

pub fn quick_switch(
    pool: &DbPool,
    undo_stack: &UndoStack,
    from_workspace_id: &str,
    to_workspace_id: &str,
) -> Result<QuickSwitchResult, CoreError> {
    let from_name = format!("Switch from {from_workspace_id}");
    let stashed = stash_now(pool, undo_stack, from_workspace_id, &from_name)?;
    let restored = restore_workspace(
        pool,
        undo_stack,
        to_workspace_id,
        ConflictResolutionMode::OverwritePosition,
    )?;

    Ok(QuickSwitchResult { stashed, restored })
}

pub fn undo_last_operation(pool: &DbPool, undo_stack: &UndoStack) -> Result<UndoItem, CoreError> {
    let item = undo_stack.pop().ok_or(CoreError::NothingToUndo)?;

    match item.action_type.as_str() {
        "stash" => {
            for hwnd_str in &item.window_hwnds {
                let clean_hex = hwnd_str.trim_start_matches("0x").trim_start_matches("0X");
                if let Ok(hwnd_val) = usize::from_str_radix(clean_hex, 16) {
                    let _ = restore_window(hwnd_val, false);
                }
            }
        }
        "restore" => {
            let _ = minimize_all_windows();
        }
        _ => {}
    }

    let _ = pool;
    Ok(item)
}
