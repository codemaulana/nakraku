# Nakraku Stash — Win32 API Surface Research & Architectural Specification

> **Target OS**: Windows 10 (Build 19041+) and Windows 11 (x64)  
> **Rust Crate**: `windows-sys` v0.59  
> **Directives**: Zero unhandled panics, typed error propagation, non-blocking asynchronous event loops.

---

## 1. Executive Summary

Nakraku Stash interacts directly with the Windows Desktop Window Manager (DWM), User32, and Kernel32 subsystem to inspect, enumerate, snapshot, minimize, and restore running applications and coordinates without requiring elevated admin privileges for standard desktop utilities.

---

## 2. API Surface Mapping by Functional Area

### 2.1 Window Enumeration & Discovery
- **`EnumWindows`** (`User32`)
  - *Signature*: `BOOL EnumWindows(WNDENUMPROC lpEnumFunc, LPARAM lParam)`
  - *Purpose*: Enumerates all top-level windows on the screen.
  - *Safety Rule*: Callback function must never panic. Always returns `TRUE` to continue enumeration until all handles are visited.
- **`IsWindow` / `IsWindowVisible`** (`User32`)
  - *Signature*: `BOOL IsWindowVisible(HWND hWnd)`
  - *Purpose*: Verifies whether the window has the `WS_VISIBLE` style.
- **`GetWindowTextW` / `GetWindowTextLengthW`** (`User32`)
  - *Signature*: `int GetWindowTextW(HWND hWnd, LPWSTR lpString, int nMaxCount)`
  - *Purpose*: Retrieves window title bar text as UTF-16.
- **`GetClassNameW`** (`User32`)
  - *Signature*: `int GetClassNameW(HWND hWnd, LPWSTR lpClassName, int nMaxCount)`
  - *Purpose*: Retrieves the Win32 window class name (e.g. `Progman`, `Shell_TrayWnd`, `Windows.UI.Core.CoreWindow`).
- **`DwmGetWindowAttribute`** (`Dwmapi`)
  - *Signature*: `HRESULT DwmGetWindowAttribute(HWND hwnd, DWORD dwAttribute, PVOID pvAttribute, DWORD cbAttribute)`
  - *Attribute*: `DWMWA_CLOAKED` (`14`)
  - *Purpose*: Determines whether a window is cloaked (hidden on another virtual desktop, minimized UWP app, or suspended tile). Windows with `DWMWA_CLOAKED != 0` must be excluded from active stashes.

---

### 2.2 Window Positioning & Hierarchy
- **`GetWindowRect`** (`User32`)
  - *Signature*: `BOOL GetWindowRect(HWND hWnd, LPRECT lpRect)`
  - *Purpose*: Returns screen coordinates (`left`, `top`, `right`, `bottom`) in virtual desktop pixels (supports multi-monitor setups with negative offsets).
- **`GetWindowPlacement` / `SetWindowPlacement`** (`User32`)
  - *Signature*: `BOOL GetWindowPlacement(HWND hWnd, WINDOWPLACEMENT *lpwndpl)`
  - *Purpose*: Preserves the exact restored position, minimized position, maximized position, and show state (`SW_SHOWMINIMIZED`, `SW_SHOWMAXIMIZED`, `SW_SHOWNORMAL`).
- **`SetWindowPos`** (`User32`)
  - *Signature*: `BOOL SetWindowPos(HWND hWnd, HWND hWndInsertAfter, int X, int Y, int cx, int cy, UINT uFlags)`
  - *Flags*: `SWP_NOACTIVATE | SWP_NOZORDER`
  - *Purpose*: Repositions restored windows accurately to saved coordinates.
- **`ShowWindow`** (`User32`)
  - *Commands*:
    - `SW_MINIMIZE` (`6`): Minimizes window into taskbar without blocking.
    - `SW_RESTORE` (`9`): Restores window to previous non-minimized state.
    - `SW_SHOWNA` (`8`): Displays window without activating focus.

---

### 2.3 Process Inspection & Memory Telemetry
- **`GetWindowThreadProcessId`** (`User32`)
  - *Signature*: `DWORD GetWindowThreadProcessId(HWND hWnd, LPDWORD lpdwProcessId)`
  - *Purpose*: Maps HWND to target Process ID (PID).
- **`OpenProcess`** (`Kernel32`)
  - *Signature*: `HANDLE OpenProcess(DWORD dwDesiredAccess, BOOL bInheritHandle, DWORD dwProcessId)`
  - *Access*:
    - Try `PROCESS_QUERY_INFORMATION | PROCESS_VM_READ`
    - Fallback: `PROCESS_QUERY_LIMITED_INFORMATION`
  - *Purpose*: Obtains handle for reading executable path and memory usage.
- **`QueryFullProcessImageNameW`** (`Kernel32`)
  - *Signature*: `BOOL QueryFullProcessImageNameW(HANDLE hProcess, DWORD dwFlags, LPWSTR lpExeName, PDWORD lpdwSize)`
  - *Purpose*: Obtains canonical file system path to the application `.exe`.
- **`K32GetProcessMemoryInfo`** (`Kernel32`)
  - *Signature*: `BOOL K32GetProcessMemoryInfo(HANDLE Process, PPROCESS_MEMORY_COUNTERS ppsmemCounters, DWORD cb)`
  - *Field*: `WorkingSetSize` (current physical RAM) and `PrivateUsage` (committed private memory).
- **`GlobalMemoryStatusEx`** (`Kernel32`)
  - *Signature*: `BOOL GlobalMemoryStatusEx(LPMEMORYSTATUSEX lpBuffer)`
  - *Purpose*: Global machine telemetry: total installed RAM, available RAM, and memory load percentage.

---

### 2.4 Process Launch & Lifecycle
- **`CreateProcessW`** / Rust `std::process::Command` (`Kernel32`)
  - *Purpose*: Restarts applications that are closed during a workspace restore session.
  - *Arguments*: Preserved working directory and standard CLI arguments if applicable.

---

### 2.5 OS Event Hooks (Reactive Telemetry)
- **`SetWinEventHook` / `UnhookWinEvent`** (`User32`)
  - *Signature*: `HWINEVENTHOOK SetWinEventHook(DWORD eventMin, DWORD eventMax, HMODULE hmodWinEventProc, WINEVENTPROC pfnWinEventProc, DWORD idProcess, DWORD idThread, DWORD dwFlags)`
  - *Flags*: `WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS`
  - *Events*:
    - `EVENT_SYSTEM_FOREGROUND` (`0x0003`): Active window focus change.
    - `EVENT_OBJECT_CREATE` (`0x8000`) & `EVENT_OBJECT_DESTROY` (`0x8001`): Window lifecycle changes.
  - *Thread Model*: Must run on a dedicated worker thread with a Windows message loop (`GetMessageW` / `DispatchMessageW`).

---

## 3. Exclusion Filter Matrix

The following window categories MUST be filtered out of stash snapshots:

| Filter Rule | Detection Method | Reason |
|---|---|---|
| **Windows Desktop Shell** | Class: `Progman`, `WorkerW`, `Shell_TrayWnd`, `Shell_SecondaryTrayWnd` | Desktop icons and Windows Taskbar |
| **UWP System Experience** | Class: `Windows.UI.Core.CoreWindow`, exe: `SearchHost.exe`, `StartMenuExperienceHost.exe`, `TextInputHost.exe` | Windows 10/11 Start menu and search flyouts |
| **Cloaked Windows** | `DwmGetWindowAttribute(hwnd, DWMWA_CLOAKED)` != 0 | Windows on other virtual desktops or background apps |
| **Zero-Sized / Offscreen** | `rect.right - rect.left <= 0` or `rect.bottom - rect.top <= 0` | Invisible helper windows, message pumps |
| **Nakraku Self-Window** | Process PID == `std::process::id()` | Nakraku Stash UI must never freeze or stash itself |
| **Tooltips & Menus** | Style contains `WS_POPUP` without `WS_CAPTION`, or class `tooltips_class32`, `#32768` | Context menus and ephemeral tooltips |

---

## 4. Safety & Panic Prevention

1. **Handle Leaks**: Every Win32 handle (`HANDLE`, `HWINEVENTHOOK`) must be closed via `CloseHandle` or RAII drop wrappers.
2. **Access Denied**: System / Administrator processes will return `ERROR_ACCESS_DENIED` (`5`). The engine flags these as `is_elevated: true` without panicking.
3. **Encoding**: String buffers from `GetWindowTextW` and `QueryFullProcessImageNameW` are converted using `String::from_utf16_lossy()`.
