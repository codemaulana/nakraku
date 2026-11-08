use super::error::WsError;
use super::server::WsServer;
use super::types::{WsStatusPayload, WsTabItem};
use tauri::State;

#[tauri::command]
pub fn cmd_ws_get_status(server: State<WsServer>) -> Result<WsStatusPayload, WsError> {
    server.get_status()
}

#[tauri::command]
pub fn cmd_ws_get_tabs(server: State<WsServer>) -> Result<Vec<WsTabItem>, WsError> {
    server.trigger_get_tabs()?;
    server.get_cached_tabs()
}

#[tauri::command]
pub fn cmd_ws_stash_tabs(server: State<WsServer>) -> Result<Vec<WsTabItem>, WsError> {
    server.trigger_stash_tabs()?;
    server.get_last_stashed()
}

#[tauri::command]
pub fn cmd_ws_restore_tabs(
    server: State<WsServer>,
    tabs: Vec<WsTabItem>,
) -> Result<(), WsError> {
    server.trigger_restore_tabs(tabs)
}

#[tauri::command]
pub fn cmd_ws_get_last_stashed(server: State<WsServer>) -> Result<Vec<WsTabItem>, WsError> {
    server.get_last_stashed()
}
