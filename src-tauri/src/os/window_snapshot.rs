use super::error::OsError;
use super::types::SessionSnapshot;
use super::window_enum::enumerate_windows;
use std::time::{SystemTime, UNIX_EPOCH};

pub fn snapshot_session() -> Result<SessionSnapshot, OsError> {
    let windows = enumerate_windows()?;
    let total_ram_saved_bytes = windows.iter().map(|w| w.ram_bytes).sum();

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    Ok(SessionSnapshot {
        timestamp,
        windows,
        total_ram_saved_bytes,
    })
}
