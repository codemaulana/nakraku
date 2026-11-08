use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

pub fn setup_global_shortcuts(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let stash_shortcut: Shortcut = "Ctrl+Shift+N".parse()?;
    let restore_shortcut: Shortcut = "Ctrl+Shift+R".parse()?;

    let stash_clone = stash_shortcut.clone();
    let restore_clone = restore_shortcut.clone();

    app.plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app_handle, shortcut, event| {
                if event.state() == ShortcutState::Pressed {
                    if shortcut == &stash_clone {
                        let _ = app_handle.emit("global:new-stash", ());
                    } else if shortcut == &restore_clone {
                        let _ = app_handle.emit("global:restore-last", ());
                    }
                }
            })
            .build(),
    )?;

    let _ = app.global_shortcut().register(stash_shortcut);
    let _ = app.global_shortcut().register(restore_shortcut);

    Ok(())
}
