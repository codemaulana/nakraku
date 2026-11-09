//! Nakraku Stash — Core native desktop library for Windows 10/11.
//!
//! Provides Win32 window snapshot and restore orchestration, embedded SQLite storage,
//! offline Ed25519 cryptographic licensing, and a local loopback WebSocket server
//! for companion browser extensions.

pub mod core;
pub mod db;
pub mod error;
pub mod license;
pub mod logging;
pub mod os;
pub mod ws;
mod shortcuts;
mod tray;
mod window_state;

use tauri::{Manager, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;

/// Main application entry point initializing plugins, SQLite, system tray, and OS listeners.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let _ = logging::configure_logging(app);

            match db::setup_db(app.handle()) {
                Ok(pool) => {
                    app.manage(pool);
                }
                Err(err) => {
                    eprintln!("Warning: Failed to initialize SQLite database: {}", err);
                }
            }

            app.manage(core::undo_stack::UndoStack::new());
            app.manage(ws::init_ws_server());

            if let Err(err) = tray::setup_tray(app.handle()) {
                eprintln!("Warning: Failed to setup system tray: {}", err);
            }

            if let Err(err) = shortcuts::setup_global_shortcuts(app.handle()) {
                eprintln!("Warning: Failed to setup global shortcuts: {}", err);
            }

            if let Err(err) = os::events::start_os_event_listener(app.handle().clone()) {
                eprintln!("Warning: Failed to setup OS event listener: {}", err);
            }

            if let Some(main_win) = app.get_webview_window("main") {
                let _ = window_state::restore_window_state(&main_win);

                let win_clone = main_win.clone();
                main_win.on_window_event(move |event| match event {
                    WindowEvent::CloseRequested { api, .. } => {
                        api.prevent_close();
                        let _ = win_clone.hide();
                        let _ = window_state::save_window_state(&win_clone);
                    }
                    WindowEvent::Moved(_) | WindowEvent::Resized(_) => {
                        let _ = window_state::save_window_state(&win_clone);
                    }
                    _ => {}
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            tray::update_tray_status,
            db::commands::create_workspace,
            db::commands::list_workspaces,
            db::commands::get_workspace,
            db::commands::rename_workspace,
            db::commands::delete_workspace,
            db::commands::reorder_workspaces,
            db::commands::save_session,
            db::commands::list_sessions,
            db::commands::get_session,
            db::commands::delete_session,
            db::commands::save_session_windows,
            db::commands::get_session_windows,
            db::commands::get_window_tabs,
            db::commands::get_setting,
            db::commands::set_setting,
            db::commands::backup_database,
            db::commands::get_database_path,
            db::commands::purge_all_sessions,
            os::commands::cmd_snapshot_session,
            os::commands::cmd_get_live_windows,
            os::commands::cmd_minimize_all,
            os::commands::cmd_get_memory_stats,
            os::commands::cmd_restore_window,
            os::commands::cmd_minimize_window,
            os::commands::cmd_restore_session,
            core::commands::cmd_stash_now,
            core::commands::cmd_restore_workspace,
            core::commands::cmd_quick_switch,
            core::commands::cmd_undo_last_operation,
            core::commands::cmd_get_undo_stack_size,
            core::commands::cmd_create_workspace_validated,
            core::commands::cmd_diff_live_with_session,
            core::commands::cmd_trigger_auto_snapshot,
            ws::commands::cmd_ws_get_status,
            ws::commands::cmd_ws_get_tabs,
            ws::commands::cmd_ws_stash_tabs,
            ws::commands::cmd_ws_restore_tabs,
            ws::commands::cmd_ws_get_last_stashed,
            license::commands::cmd_get_machine_id,
            license::commands::cmd_get_license_status,
            license::commands::cmd_activate_license,
            license::commands::cmd_deactivate_license,
            logging::cmd_get_log_path,
            logging::cmd_get_recent_logs,
        ])
        .run(tauri::generate_context!());

    if let Err(err) = builder {
        eprintln!("Failed to launch Nakraku Stash: {}", err);
    }
}
