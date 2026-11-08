use crate::os::types::RawWindow;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StashResult {
    pub session_id: String,
    pub workspace_id: String,
    pub window_count: u32,
    pub ram_saved_bytes: u64,
    pub minimized_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestoreResult {
    pub session_id: String,
    pub workspace_id: String,
    pub restored_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuickSwitchResult {
    pub stashed: StashResult,
    pub restored: RestoreResult,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WindowMoveDiff {
    pub process_name: String,
    pub title: String,
    pub old_x: i32,
    pub old_y: i32,
    pub new_x: i32,
    pub new_y: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionDiff {
    pub added_windows: Vec<RawWindow>,
    pub removed_windows: Vec<RawWindow>,
    pub moved_windows: Vec<WindowMoveDiff>,
    pub unchanged_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UndoItem {
    pub id: String,
    pub action_type: String,
    pub workspace_id: String,
    pub session_id: String,
    pub timestamp: i64,
    pub window_hwnds: Vec<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConflictResolutionMode {
    OverwritePosition,
    SkipIfRunning,
}
