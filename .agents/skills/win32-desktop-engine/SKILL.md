---
name: win32-desktop-engine
description: Technical guidelines and patterns for Windows OS integration via Rust, Tauri v2, Win32 FFI (windows-sys), process lifecycle management, and local WebSocket communication.
---

# Win32 Desktop Engine Skill

## 1. Win32 Architecture Overview
Nakraku Stash operates directly against the Windows OS to capture, minimize, terminate, and restore application windows and browser sessions.

## 2. Windows API Surface
Key Win32 functions used via `windows-sys`:
- **Window Enumeration**: `EnumWindows`, `IsWindowVisible`, `GetWindowTextW`, `GetClassNameW`.
- **Window Coordinates & Placement**: `GetWindowPlacement`, `SetWindowPlacement`, `GetWindowRect`, `SetWindowPos`.
- **Process Inspection**: `GetWindowThreadProcessId`, `OpenProcess`, `QueryFullProcessImageNameW`, `K32GetProcessMemoryInfo`.
- **Process Lifecycle**: `CreateProcessW`, `TerminateProcess`, `ShowWindow(SW_MINIMIZE)`, `ShowWindow(SW_RESTORE)`.

## 3. Strict Safety Patterns

### 3.1 Non-Panicking Win32 Wrappers
All Win32 API calls must be wrapped in safe Rust functions returning `Result<T, OsError>`.
Never use `.unwrap()` or `.expect()` when calling Windows APIs.
```rust
pub fn get_window_title(hwnd: HWND) -> Result<String, OsError> {
    let mut buffer = [0u16; 512];
    let len = unsafe { GetWindowTextW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32) };
    if len == 0 {
        return Err(OsError::EmptyTitle);
    }
    String::from_utf16(&buffer[..len as usize]).map_err(|_| OsError::EncodingError)
}
```

### 3.2 System Window Exclusion Rules
Do not capture or stash:
- Shell windows (`Progman`, `WorkerW`, `Shell_TrayWnd`).
- Windows System apps (`SearchHost.exe`, `StartMenuExperienceHost.exe`, `TextInputHost.exe`).
- Windows with zero width or zero height (`rect.right == rect.left || rect.bottom == rect.top`).
- Tooltips, popup menus, and transparent overlay windows.

### 3.3 UAC & Elevation Handling
Processes running with elevated privileges (Administrator) cannot be inspected or controlled by a non-elevated process.
- Handle `ERROR_ACCESS_DENIED` gracefully.
- Mark elevated processes as `is_elevated: true` in the UI and allow the user to run Nakraku with administrator privileges if desired.

## 4. Local WebSocket Bridge (`ws://127.0.0.1:48123`)
- Binds strictly to loopback interface `127.0.0.1`. Never bind to `0.0.0.0`.
- Validates extension origin header or shared token.
- Protocol commands: `GET_TABS`, `STASH_TABS`, `RESTORE_TABS`, `HEARTBEAT`.

## 5. Mandatory Deep Brainstorming for OS Operations
Before implementing any Win32 engine module or IPC command (Phase 4 / Phase 5):
1. Invoke `deep-recursive-brainstormer` to construct the adversarial edge case matrix.
2. Evaluate thread-safety: ensure Win32 calls running on worker threads do not block Tauri's main event loop.
3. Validate multi-monitor coordinate transformations (virtual screen coordinates with negative offsets).
4. Define comprehensive typed error variants in `src-tauri/src/os/error.rs` before coding handlers.
