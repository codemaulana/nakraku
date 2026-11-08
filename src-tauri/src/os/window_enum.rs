use super::error::OsError;
use super::filter::should_exclude_window;
use super::process_info::get_process_info;
use super::types::{RawWindow, WindowRect};
use std::mem;
use windows_sys::Win32::Foundation::{GetLastError, SetLastError, BOOL, HWND, LPARAM, RECT};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GetClassNameW, GetWindowPlacement, GetWindowRect, GetWindowTextW,
    GetWindowThreadProcessId, IsWindow, IsWindowVisible, SW_SHOWMAXIMIZED, SW_SHOWMINIMIZED,
    WINDOWPLACEMENT,
};

struct EnumContext {
    windows: Vec<RawWindow>,
    current_z_order: i32,
}

pub fn enumerate_windows() -> Result<Vec<RawWindow>, OsError> {
    let mut context = EnumContext {
        windows: Vec::new(),
        current_z_order: 0,
    };

    unsafe {
        SetLastError(0);
    }

    let result = unsafe {
        EnumWindows(
            Some(enum_windows_proc),
            &mut context as *mut EnumContext as LPARAM,
        )
    };

    let err = unsafe { GetLastError() };
    if result == 0 && err != 0 {
        return Err(OsError::WindowEnumerationFailed(err));
    }

    Ok(context.windows)
}

unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
    if lparam == 0 || unsafe { IsWindow(hwnd) } == 0 {
        return 1;
    }

    let ctx = unsafe { &mut *(lparam as *mut EnumContext) };

    if unsafe { IsWindowVisible(hwnd) } == 0 {
        return 1;
    }

    let rect = get_window_rect(hwnd);
    let title = get_window_title(hwnd);
    let class_name = get_window_class_name(hwnd);

    let mut pid: u32 = 0;
    unsafe {
        GetWindowThreadProcessId(hwnd, &mut pid);
    }
    if pid == 0 {
        return 1;
    }

    let proc_info = get_process_info(pid).unwrap_or_else(|_| super::types::ProcessInfo {
        pid,
        name: format!("PID:{pid}"),
        exe_path: None,
        ram_bytes: 0,
        is_elevated: false,
    });

    if should_exclude_window(
        hwnd,
        &class_name,
        &proc_info.name,
        pid,
        &rect,
        &title,
    ) {
        return 1;
    }

    let (is_minimized, is_maximized) = get_window_state(hwnd);

    ctx.current_z_order += 1;
    ctx.windows.push(RawWindow {
        hwnd: format!("{:#x}", hwnd as usize),
        hwnd_val: hwnd as usize,
        title,
        class_name,
        process_id: pid,
        process_name: proc_info.name,
        exe_path: proc_info.exe_path,
        rect,
        is_visible: true,
        is_minimized,
        is_maximized,
        ram_bytes: proc_info.ram_bytes,
        is_elevated: proc_info.is_elevated,
        z_order: ctx.current_z_order,
    });

    1
}

pub fn get_window_title(hwnd: HWND) -> String {
    let mut buffer = [0u16; 512];
    let len = unsafe { GetWindowTextW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32) };
    if len > 0 {
        String::from_utf16_lossy(&buffer[..len as usize])
    } else {
        String::new()
    }
}

pub fn get_window_class_name(hwnd: HWND) -> String {
    let mut buffer = [0u16; 256];
    let len = unsafe { GetClassNameW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32) };
    if len > 0 {
        String::from_utf16_lossy(&buffer[..len as usize])
    } else {
        String::new()
    }
}

pub fn get_window_rect(hwnd: HWND) -> WindowRect {
    let mut rc: RECT = unsafe { mem::zeroed() };
    let ok = unsafe { GetWindowRect(hwnd, &mut rc) };
    if ok != 0 {
        WindowRect {
            x: rc.left,
            y: rc.top,
            width: rc.right - rc.left,
            height: rc.bottom - rc.top,
        }
    } else {
        WindowRect {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }
    }
}

pub fn get_window_state(hwnd: HWND) -> (bool, bool) {
    let mut placement: WINDOWPLACEMENT = unsafe { mem::zeroed() };
    placement.length = mem::size_of::<WINDOWPLACEMENT>() as u32;

    let ok = unsafe { GetWindowPlacement(hwnd, &mut placement) };
    if ok != 0 {
        let is_min = placement.showCmd == SW_SHOWMINIMIZED as u32;
        let is_max = placement.showCmd == SW_SHOWMAXIMIZED as u32;
        (is_min, is_max)
    } else {
        (false, false)
    }
}
