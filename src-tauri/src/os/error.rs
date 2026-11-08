use serde::Serialize;
use std::fmt;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum OsError {
    WindowEnumerationFailed(u32),
    WindowNotFound(String),
    ProcessOpenFailed(u32, u32),
    ProcessInfoFailed(u32, String),
    QueryPathFailed(u32, u32),
    MemoryQueryFailed(u32, u32),
    LaunchFailed(String, String),
    ElevationRequired(String),
    RestoreFailed(String, String),
    MinimizeFailed(String, u32),
    HookInstallationFailed(u32),
    InvalidHandle(String),
}

impl fmt::Display for OsError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::WindowEnumerationFailed(code) => {
                write!(f, "Window enumeration failed with Win32 error code {code}")
            }
            Self::WindowNotFound(hwnd) => write!(f, "Window handle '{hwnd}' was not found"),
            Self::ProcessOpenFailed(pid, code) => {
                write!(f, "Failed to open process {pid} with Win32 error code {code}")
            }
            Self::ProcessInfoFailed(pid, msg) => {
                write!(f, "Failed to query process info for PID {pid}: {msg}")
            }
            Self::QueryPathFailed(pid, code) => {
                write!(f, "Failed to query executable path for PID {pid} with code {code}")
            }
            Self::MemoryQueryFailed(pid, code) => {
                write!(f, "Failed to query memory statistics for PID {pid} with code {code}")
            }
            Self::LaunchFailed(path, err) => {
                write!(f, "Failed to launch process '{path}': {err}")
            }
            Self::ElevationRequired(name) => {
                write!(f, "Process '{name}' requires administrator elevation")
            }
            Self::RestoreFailed(hwnd, err) => {
                write!(f, "Failed to restore window '{hwnd}': {err}")
            }
            Self::MinimizeFailed(hwnd, code) => {
                write!(f, "Failed to minimize window '{hwnd}' with code {code}")
            }
            Self::HookInstallationFailed(code) => {
                write!(f, "Failed to install WinEvent hook with code {code}")
            }
            Self::InvalidHandle(msg) => write!(f, "Invalid OS handle: {msg}"),
        }
    }
}

impl std::error::Error for OsError {}
