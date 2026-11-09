use super::error::OsError;
use super::process_launch::launch_process;
use super::types::RawWindow;
use super::window_enum::enumerate_windows;
use windows_sys::Win32::Foundation::HWND;
use windows_sys::Win32::UI::WindowsAndMessaging::{
    IsWindow, SetWindowPos, ShowWindow, SWP_NOACTIVATE, SWP_NOZORDER, SW_MINIMIZE,
    SW_RESTORE, SW_SHOWMAXIMIZED,
};

pub fn minimize_all_windows() -> Result<u32, OsError> {
    let windows = enumerate_windows()?;
    let mut count = 0;

    for win in windows {
        if !win.is_minimized {
            let hwnd = win.hwnd_val as HWND;
            let ok = unsafe { ShowWindow(hwnd, SW_MINIMIZE) };
            if ok != 0 || unsafe { windows_sys::Win32::Foundation::GetLastError() } == 0 {
                count += 1;
            }
        }
    }

    Ok(count)
}

pub fn minimize_window(hwnd_val: usize) -> Result<(), OsError> {
    let hwnd = hwnd_val as HWND;
    if unsafe { IsWindow(hwnd) } == 0 {
        return Err(OsError::WindowNotFound(format!("{:#x}", hwnd_val)));
    }
    unsafe {
        ShowWindow(hwnd, SW_MINIMIZE);
    }
    Ok(())
}

pub fn restore_window(hwnd_val: usize, is_maximized: bool) -> Result<(), OsError> {
    let hwnd = hwnd_val as HWND;
    if unsafe { IsWindow(hwnd) } == 0 {
        return Err(OsError::WindowNotFound(format!("{:#x}", hwnd_val)));
    }

    unsafe {
        ShowWindow(hwnd, SW_RESTORE);
        if is_maximized {
            ShowWindow(hwnd, SW_SHOWMAXIMIZED);
        }
    }

    Ok(())
}

pub fn restore_session_windows(windows: &[RawWindow]) -> Result<(), OsError> {
    for win in windows {
        let hwnd = win.hwnd_val as HWND;
        let is_valid = unsafe { IsWindow(hwnd) } != 0;

        if is_valid {
            unsafe {
                ShowWindow(hwnd, SW_RESTORE);
                SetWindowPos(
                    hwnd,
                    std::ptr::null_mut(),
                    win.rect.x,
                    win.rect.y,
                    win.rect.width,
                    win.rect.height,
                    SWP_NOACTIVATE | SWP_NOZORDER,
                );
                if win.is_maximized {
                    ShowWindow(hwnd, SW_SHOWMAXIMIZED);
                }
            }
        } else if let Some(ref exe_path) = win.exe_path {
            let _ = launch_process(exe_path, &[]);
        }
    }

    Ok(())
}
