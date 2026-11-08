pub mod auto_snapshot;
pub mod commands;
pub mod error;
pub mod session_diff;
pub mod stash_service;
pub mod types;
pub mod undo_stack;
pub mod workspace_manager;

#[cfg(test)]
mod tests {
    use super::session_diff::diff_sessions;
    use super::types::{UndoItem, WindowMoveDiff};
    use super::undo_stack::UndoStack;
    use super::workspace_manager::{
        check_workspace_limit, validate_workspace_name, FREE_TIER_WORKSPACE_LIMIT,
    };
    use crate::db::workspace_repo::{create, CreateWorkspaceInput};
    use crate::os::types::{RawWindow, WindowRect};
    use rusqlite::Connection;
    use std::error::Error;

    fn setup_test_db() -> Result<Connection, Box<dyn Error>> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch(
            r#"
            CREATE TABLE workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT NOT NULL,
                icon TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                is_active INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE TABLE app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            );
            "#,
        )?;
        Ok(conn)
    }

    fn make_test_window(hwnd: &str, proc: &str, title: &str, x: i32, y: i32) -> RawWindow {
        RawWindow {
            hwnd: hwnd.to_string(),
            hwnd_val: 1,
            title: title.to_string(),
            class_name: "TestClass".to_string(),
            process_id: 1234,
            process_name: proc.to_string(),
            exe_path: Some(format!("C:\\bin\\{proc}")),
            rect: WindowRect {
                x,
                y,
                width: 800,
                height: 600,
            },
            is_visible: true,
            is_minimized: false,
            is_maximized: false,
            ram_bytes: 1000000,
            is_elevated: false,
            z_order: 1,
        }
    }

    #[test]
    fn test_workspace_name_validation() -> Result<(), Box<dyn Error>> {
        let existing = vec!["General".to_string(), "Coding".to_string()];

        assert!(validate_workspace_name("  Research  ", &existing).is_ok());
        assert_eq!(
            validate_workspace_name("  Research  ", &existing)?,
            "Research"
        );

        assert!(validate_workspace_name("a", &existing).is_err());
        assert!(validate_workspace_name("   ", &existing).is_err());
        assert!(validate_workspace_name("general", &existing).is_err());
        assert!(validate_workspace_name("GENERAL", &existing).is_err());

        let long_name = "a".repeat(41);
        assert!(validate_workspace_name(&long_name, &existing).is_err());

        Ok(())
    }

    #[test]
    fn test_workspace_limit_enforcement() -> Result<(), Box<dyn Error>> {
        let conn = setup_test_db()?;

        for i in 0..FREE_TIER_WORKSPACE_LIMIT {
            let ws = CreateWorkspaceInput {
                id: format!("ws_{i}"),
                name: format!("Workspace {i}"),
                color: Some("#10B981".to_string()),
                icon: Some("folder".to_string()),
            };
            create(&conn, ws)?;
        }

        let limit_check = check_workspace_limit(&conn);
        assert!(limit_check.is_err());

        conn.execute(
            "INSERT INTO app_settings (key, value, updated_at) VALUES ('license_tier', 'pro', 1000)",
            [],
        )?;

        let pro_limit_check = check_workspace_limit(&conn);
        assert!(pro_limit_check.is_ok());

        Ok(())
    }

    #[test]
    fn test_undo_stack_bounded_capacity() -> Result<(), Box<dyn Error>> {
        let stack = UndoStack::new();
        assert!(stack.is_empty());

        for i in 0..7 {
            stack.push(UndoItem {
                id: format!("undo_{i}"),
                action_type: "stash".to_string(),
                workspace_id: "ws_1".to_string(),
                session_id: format!("s_{i}"),
                timestamp: i,
                window_hwnds: vec!["0x1".to_string()],
            });
        }

        assert_eq!(stack.len(), 5);

        let latest = stack.pop();
        assert!(latest.is_some());
        if let Some(item) = latest {
            assert_eq!(item.id, "undo_6");
        }

        Ok(())
    }

    #[test]
    fn test_session_diff_engine_comprehensive() -> Result<(), Box<dyn Error>> {
        let w1 = make_test_window("0x1", "code.exe", "VS Code", 0, 0);
        let w2 = make_test_window("0x2", "chrome.exe", "Browser", 100, 100);
        let base = vec![w1.clone(), w2.clone()];

        let empty_diff = diff_sessions(&[], &[]);
        assert_eq!(empty_diff.unchanged_count, 0);
        assert!(empty_diff.added_windows.is_empty());
        assert!(empty_diff.removed_windows.is_empty());

        let identical_diff = diff_sessions(&base, &base);
        assert_eq!(identical_diff.unchanged_count, 2);
        assert!(identical_diff.moved_windows.is_empty());

        let mut w2_moved = w2.clone();
        w2_moved.rect.x = 250;
        let w3_added = make_test_window("0x3", "spotify.exe", "Music", 50, 50);
        let current = vec![w1, w2_moved, w3_added];

        let diff = diff_sessions(&base, &current);
        assert_eq!(diff.unchanged_count, 1);
        assert_eq!(diff.added_windows.len(), 1);
        assert_eq!(diff.added_windows[0].hwnd, "0x3");
        assert_eq!(diff.moved_windows.len(), 1);
        assert_eq!(
            diff.moved_windows[0],
            WindowMoveDiff {
                process_name: "chrome.exe".to_string(),
                title: "Browser".to_string(),
                old_x: 100,
                old_y: 100,
                new_x: 250,
                new_y: 100,
            }
        );
        assert!(diff.removed_windows.is_empty());

        let removed_diff = diff_sessions(&base, &[]);
        assert_eq!(removed_diff.removed_windows.len(), 2);
        assert_eq!(removed_diff.unchanged_count, 0);

        Ok(())
    }
}
