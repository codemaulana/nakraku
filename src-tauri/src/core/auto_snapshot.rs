use super::error::CoreError;
use crate::db::session_repo::{self, CreateSessionInput};
use crate::db::window_repo::{self, InsertWindowInput};
use crate::db::DbPool;
use crate::os::window_snapshot::snapshot_session;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

pub const MAX_AUTO_SNAPSHOTS_KEPT: usize = 5;

pub fn parse_interval(interval_str: &str) -> Option<Duration> {
    match interval_str.trim().to_lowercase().as_str() {
        "5m" => Some(Duration::from_secs(5 * 60)),
        "15m" => Some(Duration::from_secs(15 * 60)),
        "30m" => Some(Duration::from_secs(30 * 60)),
        "1h" => Some(Duration::from_secs(60 * 60)),
        _ => None,
    }
}

pub fn execute_auto_snapshot(pool: &DbPool, workspace_id: &str) -> Result<String, CoreError> {
    let snapshot = snapshot_session().map_err(|e| CoreError::OsError(e.to_string()))?;

    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    let session_id = format!("auto_{now_ms}");
    let session_name = format!("Auto-Snapshot {}", now_ms);

    let mut conn = pool
        .lock()
        .map_err(|e| CoreError::LockError(e.to_string()))?;

    let new_session = CreateSessionInput {
        id: session_id.clone(),
        workspace_id: workspace_id.to_string(),
        name: session_name,
        window_count: snapshot.windows.len() as i32,
        ram_saved_bytes: snapshot.total_ram_saved_bytes as i64,
        is_frozen: false,
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

    prune_old_auto_snapshots(&conn, workspace_id, MAX_AUTO_SNAPSHOTS_KEPT)?;

    Ok(session_id)
}

pub fn prune_old_auto_snapshots(
    conn: &rusqlite::Connection,
    workspace_id: &str,
    keep_count: usize,
) -> Result<usize, CoreError> {
    let sessions = session_repo::list_sessions(conn, workspace_id)
        .map_err(|e| CoreError::DbError(e.to_string()))?;

    let auto_sessions: Vec<_> = sessions
        .into_iter()
        .filter(|s| s.name.starts_with("Auto-Snapshot"))
        .collect();

    if auto_sessions.len() <= keep_count {
        return Ok(0);
    }

    let to_delete_count = auto_sessions.len() - keep_count;
    let mut deleted = 0;

    for s in auto_sessions.iter().take(to_delete_count) {
        if session_repo::delete_session(conn, &s.id).is_ok() {
            deleted += 1;
        }
    }

    Ok(deleted)
}
