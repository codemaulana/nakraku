use base64::Engine;
use std::collections::HashMap;
use std::ffi::c_void;
use std::ptr::null_mut;
use std::sync::{LazyLock, Mutex};
use windows_sys::Win32::Foundation::HWND;
use windows_sys::Win32::Graphics::Gdi::{
    CreateCompatibleDC, DeleteDC, DeleteObject, GetDIBits, GetObjectW, BITMAP, BITMAPINFO,
    BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    DestroyIcon, GetIconInfo, SendMessageTimeoutW, HICON, ICONINFO, ICON_SMALL, SMTO_ABORTIFHUNG,
    WM_GETICON,
};

#[repr(C)]
struct ShFileInfoW {
    h_icon: HICON,
    i_icon: i32,
    dw_attributes: u32,
    sz_display_name: [u16; 260],
    sz_type_name: [u16; 80],
}

const SHGFI_ICON: u32 = 0x00000100;
const SHGFI_SMALLICON: u32 = 0x00000001;

#[link(name = "shell32")]
unsafe extern "system" {
    fn SHGetFileInfoW(
        psz_path: *const u16,
        dw_file_attributes: u32,
        psfi: *mut ShFileInfoW,
        cb_file_info: u32,
        u_flags: u32,
    ) -> usize;
}

static ICON_CACHE: LazyLock<Mutex<HashMap<String, Option<String>>>> =
    LazyLock::new(|| Mutex::new(HashMap::with_capacity(64)));

pub fn get_window_icon(hwnd: HWND, exe_path: Option<&str>) -> Option<String> {
    let cache_key = match exe_path {
        Some(path) if !path.is_empty() => path.to_lowercase(),
        _ => format!("hwnd:{:#x}", hwnd as usize),
    };

    if let Ok(guard) = ICON_CACHE.lock() {
        if let Some(cached) = guard.get(&cache_key) {
            return cached.clone();
        }
    }

    let icon_data = extract_icon_as_base64(hwnd, exe_path);

    if let Ok(mut guard) = ICON_CACHE.lock() {
        guard.insert(cache_key, icon_data.clone());
    }

    icon_data
}

fn extract_icon_as_base64(hwnd: HWND, exe_path: Option<&str>) -> Option<String> {
    unsafe {
        let mut hicon = null_mut() as HICON;

        if let Some(path) = exe_path {
            let wide: Vec<u16> = path.encode_utf16().chain(std::iter::once(0)).collect();
            let mut shfi: ShFileInfoW = std::mem::zeroed();
            let ok = SHGetFileInfoW(
                wide.as_ptr(),
                0,
                &mut shfi,
                std::mem::size_of::<ShFileInfoW>() as u32,
                SHGFI_ICON | SHGFI_SMALLICON,
            );
            if ok != 0 && !shfi.h_icon.is_null() {
                hicon = shfi.h_icon;
            }
        }

        if hicon.is_null() && !hwnd.is_null() {
            let mut result: usize = 0;
            SendMessageTimeoutW(
                hwnd,
                WM_GETICON,
                ICON_SMALL as usize,
                0,
                SMTO_ABORTIFHUNG,
                40,
                &mut result,
            );
            if result != 0 {
                hicon = result as HICON;
            }
        }

        if hicon.is_null() {
            return None;
        }

        let mut icon_info: ICONINFO = std::mem::zeroed();
        if GetIconInfo(hicon, &mut icon_info) == 0 {
            DestroyIcon(hicon);
            return None;
        }

        let hbm = if !icon_info.hbmColor.is_null() {
            icon_info.hbmColor
        } else {
            icon_info.hbmMask
        };

        if hbm.is_null() {
            if !icon_info.hbmMask.is_null() {
                DeleteObject(icon_info.hbmMask as _);
            }
            DestroyIcon(hicon);
            return None;
        }

        let mut bmp: BITMAP = std::mem::zeroed();
        GetObjectW(
            hbm as _,
            std::mem::size_of::<BITMAP>() as i32,
            &mut bmp as *mut _ as *mut c_void,
        );

        let width = if bmp.bmWidth > 0 && bmp.bmWidth <= 128 {
            bmp.bmWidth
        } else {
            32
        };
        let height = if bmp.bmHeight > 0 && bmp.bmHeight <= 128 {
            bmp.bmHeight
        } else {
            32
        };

        let hdc = CreateCompatibleDC(null_mut());
        let mut bi: BITMAPINFO = std::mem::zeroed();
        bi.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
        bi.bmiHeader.biWidth = width;
        bi.bmiHeader.biHeight = -height;
        bi.bmiHeader.biPlanes = 1;
        bi.bmiHeader.biBitCount = 32;
        bi.bmiHeader.biCompression = BI_RGB as u32;

        let pixel_bytes_len = (width * height * 4) as usize;
        let mut pixels = vec![0u8; pixel_bytes_len];

        GetDIBits(
            hdc,
            hbm,
            0,
            height as u32,
            pixels.as_mut_ptr() as *mut c_void,
            &mut bi,
            DIB_RGB_COLORS,
        );

        DeleteDC(hdc);
        if !icon_info.hbmColor.is_null() {
            DeleteObject(icon_info.hbmColor as _);
        }
        if !icon_info.hbmMask.is_null() {
            DeleteObject(icon_info.hbmMask as _);
        }
        DestroyIcon(hicon);

        let has_alpha = pixels.chunks_exact(4).any(|chunk| chunk[3] > 0);
        if !has_alpha {
            for chunk in pixels.chunks_exact_mut(4) {
                if chunk[0] != 0 || chunk[1] != 0 || chunk[2] != 0 {
                    chunk[3] = 255;
                }
            }
        }

        let file_header_len = 14u32;
        let info_header_len = 40u32;
        let total_size = file_header_len + info_header_len + pixel_bytes_len as u32;

        let mut bmp_data = Vec::with_capacity(total_size as usize);
        bmp_data.extend_from_slice(b"BM");
        bmp_data.extend_from_slice(&total_size.to_le_bytes());
        bmp_data.extend_from_slice(&[0u8; 4]);
        bmp_data.extend_from_slice(&(54u32).to_le_bytes());

        bmp_data.extend_from_slice(&(40u32).to_le_bytes());
        bmp_data.extend_from_slice(&width.to_le_bytes());
        bmp_data.extend_from_slice(&(-height).to_le_bytes());
        bmp_data.extend_from_slice(&(1u16).to_le_bytes());
        bmp_data.extend_from_slice(&(32u16).to_le_bytes());
        bmp_data.extend_from_slice(&(0u32).to_le_bytes());
        bmp_data.extend_from_slice(&(pixel_bytes_len as u32).to_le_bytes());
        bmp_data.extend_from_slice(&(0u32).to_le_bytes());
        bmp_data.extend_from_slice(&(0u32).to_le_bytes());
        bmp_data.extend_from_slice(&(0u32).to_le_bytes());
        bmp_data.extend_from_slice(&(0u32).to_le_bytes());

        bmp_data.extend_from_slice(&pixels);

        let encoded = base64::engine::general_purpose::STANDARD.encode(&bmp_data);
        Some(format!("data:image/bmp;base64,{encoded}"))
    }
}
