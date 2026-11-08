use super::error::OsError;
use super::window_enum::get_window_title;
use serde::Serialize;
use std::mem;
use std::sync::Mutex;
use std::thread;
use tauri::{AppHandle, Emitter};
use windows_sys::Win32::Foundation::HWND;
use windows_sys::Win32::UI::Accessibility::{SetWinEventHook, UnhookWinEvent, HWINEVENTHOOK};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    DispatchMessageW, GetMessageW, GetWindowThreadProcessId, TranslateMessage,
    EVENT_OBJECT_CREATE, EVENT_OBJECT_DESTROY, EVENT_SYSTEM_FOREGROUND, MSG,
};

const WINEVENT_OUTOFCONTEXT: u32 = 0x0000;
const WINEVENT_SKIPOWNPROCESS: u32 = 0x0002;

static GLOBAL_APP_HANDLE: Mutex<Option<AppHandle>> = Mutex::new(None);

#[derive(Debug, Clone, Serialize)]
pub struct ForegroundChangedPayload {
    pub hwnd: String,
    pub title: String,
    pub pid: u32,
}

#[derive(Debug, Clone, Serialize)]
pub struct WindowLifecyclePayload {
    pub event_type: String,
    pub hwnd: String,
}

pub fn start_os_event_listener(app: AppHandle) -> Result<(), OsError> {
    if let Ok(mut lock) = GLOBAL_APP_HANDLE.lock() {
        *lock = Some(app);
    }

    thread::spawn(|| {
        let hook_flags = WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS;

        let foreground_hook = unsafe {
            SetWinEventHook(
                EVENT_SYSTEM_FOREGROUND,
                EVENT_SYSTEM_FOREGROUND,
                std::ptr::null_mut(),
                Some(win_event_proc),
                0,
                0,
                hook_flags,
            )
        };

        let lifecycle_hook = unsafe {
            SetWinEventHook(
                EVENT_OBJECT_CREATE,
                EVENT_OBJECT_DESTROY,
                std::ptr::null_mut(),
                Some(win_event_proc),
                0,
                0,
                hook_flags,
            )
        };

        let mut msg: MSG = unsafe { mem::zeroed() };
        while unsafe { GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) } > 0 {
            unsafe {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        }

        if !foreground_hook.is_null() {
            unsafe {
                UnhookWinEvent(foreground_hook);
            }
        }
        if !lifecycle_hook.is_null() {
            unsafe {
                UnhookWinEvent(lifecycle_hook);
            }
        }
    });

    Ok(())
}

unsafe extern "system" fn win_event_proc(
    _hook: HWINEVENTHOOK,
    event: u32,
    hwnd: HWND,
    id_object: i32,
    _id_child: i32,
    _event_thread: u32,
    _event_time: u32,
) {
    if id_object != 0 || hwnd.is_null() {
        return;
    }

    let app_handle = match GLOBAL_APP_HANDLE.lock() {
        Ok(guard) => guard.clone(),
        Err(_) => None,
    };

    let app = match app_handle {
        Some(a) => a,
        None => return,
    };

    let hwnd_str = format!("{:#x}", hwnd as usize);

    if event == EVENT_SYSTEM_FOREGROUND {
        let title = get_window_title(hwnd);
        let mut pid: u32 = 0;
        unsafe {
            GetWindowThreadProcessId(hwnd, &mut pid);
        }

        let _ = app.emit(
            "os:foreground-changed",
            ForegroundChangedPayload {
                hwnd: hwnd_str,
                title,
                pid,
            },
        );
    } else if event == EVENT_OBJECT_CREATE {
        let _ = app.emit(
            "os:window-lifecycle",
            WindowLifecyclePayload {
                event_type: "create".to_string(),
                hwnd: hwnd_str,
            },
        );
    } else if event == EVENT_OBJECT_DESTROY {
        let _ = app.emit(
            "os:window-lifecycle",
            WindowLifecyclePayload {
                event_type: "destroy".to_string(),
                hwnd: hwnd_str,
            },
        );
    }
}
