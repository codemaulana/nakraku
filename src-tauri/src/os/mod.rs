pub mod commands;
pub mod error;
pub mod events;
pub mod filter;
pub mod icon;
pub mod process_info;
pub mod process_launch;
pub mod types;
pub mod window_enum;
pub mod window_restore;
pub mod window_snapshot;

#[cfg(test)]
mod tests {
    use super::filter::should_exclude_window;
    use super::process_info::get_system_memory_stats;
    use super::types::WindowRect;
    use super::window_enum::enumerate_windows;
    use super::window_snapshot::snapshot_session;
    use std::error::Error;

    #[test]
    fn test_system_memory_stats() -> Result<(), Box<dyn Error>> {
        let stats = get_system_memory_stats()?;
        assert!(stats.total_ram_bytes > 0);
        assert!(stats.available_ram_bytes > 0);
        assert!(stats.memory_load_percentage <= 100);
        Ok(())
    }

    #[test]
    fn test_window_enumeration_safety() -> Result<(), Box<dyn Error>> {
        let windows = enumerate_windows()?;
        for win in &windows {
            assert!(!win.title.trim().is_empty());
            assert!(win.rect.width > 0);
            assert!(win.rect.height > 0);
            assert_ne!(win.process_id, std::process::id());
        }
        Ok(())
    }

    #[test]
    fn test_filter_exclusion_rules() -> Result<(), Box<dyn Error>> {
        let dummy_rect = WindowRect {
            x: 0,
            y: 0,
            width: 800,
            height: 600,
        };

        let zero_rect = WindowRect {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };

        let is_self_excluded = should_exclude_window(
            std::ptr::null_mut(),
            "StandardWindow",
            "app.exe",
            std::process::id(),
            &dummy_rect,
            "My App",
        );
        assert!(is_self_excluded);

        let is_zero_excluded = should_exclude_window(
            std::ptr::null_mut(),
            "StandardWindow",
            "app.exe",
            1234,
            &zero_rect,
            "My App",
        );
        assert!(is_zero_excluded);

        let is_shell_excluded = should_exclude_window(
            std::ptr::null_mut(),
            "Shell_TrayWnd",
            "explorer.exe",
            1234,
            &dummy_rect,
            "Taskbar",
        );
        assert!(is_shell_excluded);

        let is_valid_kept = should_exclude_window(
            std::ptr::null_mut(),
            "Chrome_WidgetWin_1",
            "chrome.exe",
            1234,
            &dummy_rect,
            "Google Chrome",
        );
        assert!(!is_valid_kept);

        Ok(())
    }

    #[test]
    fn test_snapshot_session() -> Result<(), Box<dyn Error>> {
        let snapshot = snapshot_session()?;
        assert!(snapshot.timestamp > 0);
        Ok(())
    }
}
