use super::error::OsError;
use super::process_info::get_system_memory_stats;
use super::types::{MemoryStats, RawWindow, SessionSnapshot, WindowRect};
use super::window_enum::enumerate_windows;
use super::window_restore::{minimize_all_windows, minimize_window, restore_session_windows, restore_window};
use super::window_snapshot::snapshot_session;
use crate::db::window_repo;
use crate::db::DbPool;
use tauri::State;

#[tauri::command]
pub fn cmd_snapshot_session() -> Result<SessionSnapshot, String> {
    snapshot_session().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_get_live_windows() -> Result<Vec<RawWindow>, String> {
    enumerate_windows().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_minimize_all() -> Result<u32, String> {
    minimize_all_windows().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_get_memory_stats() -> Result<MemoryStats, String> {
    get_system_memory_stats().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_minimize_window(hwnd: String) -> Result<(), String> {
    let clean_hex = hwnd.trim_start_matches("0x").trim_start_matches("0X");
    let hwnd_val = usize::from_str_radix(clean_hex, 16)
        .map_err(|_| format!("Invalid hex HWND format: {hwnd}"))?;

    minimize_window(hwnd_val).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_restore_window(hwnd: String, is_maximized: bool) -> Result<(), String> {
    let clean_hex = hwnd.trim_start_matches("0x").trim_start_matches("0X");
    let hwnd_val = usize::from_str_radix(clean_hex, 16)
        .map_err(|_| format!("Invalid hex HWND format: {hwnd}"))?;

    restore_window(hwnd_val, is_maximized).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_restore_session(pool: State<'_, DbPool>, session_id: String) -> Result<u32, String> {
    let conn = pool
        .lock()
        .map_err(|_| "Failed to lock database connection".to_string())?;

    let windows = window_repo::list_by_session(&conn, &session_id)
        .map_err(|e| format!("Failed to read session windows from DB: {e}"))?;

    let raw_windows: Vec<RawWindow> = windows
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

    let count = raw_windows.len() as u32;
    restore_session_windows(&raw_windows).map_err(|e: OsError| e.to_string())?;

    Ok(count)
}
