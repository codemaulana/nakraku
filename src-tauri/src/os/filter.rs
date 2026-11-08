use super::types::WindowRect;
use std::ffi::c_void;
use windows_sys::Win32::Foundation::HWND;
use windows_sys::Win32::Graphics::Dwm::{DwmGetWindowAttribute, DWMWA_CLOAKED};

const EXCLUDED_CLASSES: &[&str] = &[
    "Progman",
    "WorkerW",
    "Shell_TrayWnd",
    "Shell_SecondaryTrayWnd",
    "tooltips_class32",
    "MSCTFIME UI",
    "#32768",
    "IME",
    "Windows.UI.Core.CoreWindow",
    "CEF-OSC-WIDGET",
    "NVIDIA GeForce Overlay DT",
];

const EXCLUDED_PROCESSES: &[&str] = &[
    "searchhost.exe",
    "startmenuexperiencehost.exe",
    "textinputhost.exe",
    "shellexperiencehost.exe",
    "lockapp.exe",
    "systemsettings.exe",
    "applicationframehost.exe",
    "nvidia overlay.exe",
    "nvcontainer.exe",
    "nvspcaps64.exe",
    "geforceexperience.exe",
    "geforceshare.exe",
    "discordhookhelper64.exe",
];

pub fn is_cloaked(hwnd: HWND) -> bool {
    let mut cloaked: u32 = 0;
    let size = std::mem::size_of::<u32>() as u32;
    let hr = unsafe {
        DwmGetWindowAttribute(
            hwnd,
            DWMWA_CLOAKED as u32,
            &mut cloaked as *mut u32 as *mut c_void,
            size,
        )
    };
    hr == 0 && cloaked != 0
}

pub fn should_exclude_window(
    hwnd: HWND,
    class_name: &str,
    process_name: &str,
    process_id: u32,
    rect: &WindowRect,
    title: &str,
) -> bool {
    if process_id == std::process::id() {
        return true;
    }

    if rect.width <= 0 || rect.height <= 0 {
        return true;
    }

    let trimmed_title = title.trim();
    if trimmed_title.is_empty() {
        return true;
    }

    let lower_proc = process_name.to_lowercase();
    if EXCLUDED_PROCESSES.iter().any(|&p| lower_proc == p) {
        return true;
    }

    if EXCLUDED_CLASSES.iter().any(|&c| class_name == c) {
        return true;
    }

    if is_cloaked(hwnd) {
        return true;
    }

    false
}
