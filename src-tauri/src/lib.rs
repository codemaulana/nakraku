mod shortcuts;
mod tray;
mod window_state;

use tauri::{Manager, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .setup(|app| {
            if cfg!(debug_assertions) {
                let _ = app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                );
            }

            if let Err(err) = tray::setup_tray(app.handle()) {
                eprintln!("Warning: Failed to setup system tray: {}", err);
            }

            if let Err(err) = shortcuts::setup_global_shortcuts(app.handle()) {
                eprintln!("Warning: Failed to setup global shortcuts: {}", err);
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
        ])
        .run(tauri::generate_context!());

    if let Err(err) = builder {
        eprintln!("Failed to launch Nakraku Stash: {}", err);
    }
}
