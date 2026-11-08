use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

pub const TRAY_ID: &str = "nakraku-tray";

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show_item = MenuItem::with_id(app, "show", "Show Nakraku Stash", true, None::<&str>)?;
    let stash_item = MenuItem::with_id(app, "stash_now", "Stash All Now", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit Nakraku", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_item, &stash_item, &quit_item])?;

    let icon = match app.default_window_icon() {
        Some(ic) => ic.clone(),
        None => return Err("Failed to resolve application default window icon for tray".into()),
    };

    let _tray = TrayIconBuilder::with_id(TRAY_ID)
        .tooltip("Nakraku Stash - Memory Optimizer")
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app_handle, event| match event.id.as_ref() {
            "show" => {
                if let Some(win) = app_handle.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.unminimize();
                    let _ = win.set_focus();
                }
            }
            "stash_now" => {
                let _ = app_handle.emit("tray:stash-now", ());
            }
            "quit" => {
                app_handle.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app_handle = tray.app_handle();
                if let Some(win) = app_handle.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.unminimize();
                    let _ = win.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}

#[tauri::command]
pub fn update_tray_status(
    app: AppHandle,
    active_workspaces: u32,
    ram_saved: String,
) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let tooltip = format!(
            "Nakraku Stash: {} workspaces • {} RAM saved",
            active_workspaces, ram_saved
        );
        let _ = tray.set_tooltip(Some(tooltip));
    }
    Ok(())
}
