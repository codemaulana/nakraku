use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct WindowRect {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawWindow {
    pub hwnd: String,
    pub hwnd_val: usize,
    pub title: String,
    pub class_name: String,
    pub process_id: u32,
    pub process_name: String,
    pub exe_path: Option<String>,
    pub rect: WindowRect,
    pub is_visible: bool,
    pub is_minimized: bool,
    pub is_maximized: bool,
    pub ram_bytes: u64,
    pub is_elevated: bool,
    pub z_order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub exe_path: Option<String>,
    pub ram_bytes: u64,
    pub is_elevated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub total_ram_bytes: u64,
    pub used_ram_bytes: u64,
    pub available_ram_bytes: u64,
    pub memory_load_percentage: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionSnapshot {
    pub timestamp: i64,
    pub windows: Vec<RawWindow>,
    pub total_ram_saved_bytes: u64,
}
