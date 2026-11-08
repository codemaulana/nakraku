use sha2::{Digest, Sha256};
use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;
use windows_sys::Win32::System::Registry::{
    RegCloseKey, RegOpenKeyExW, RegQueryValueExW, HKEY, HKEY_LOCAL_MACHINE, KEY_READ,
    KEY_WOW64_64KEY, REG_SZ,
};

const CRYPTO_SUBKEY: &[u16] = &[
    b'S' as u16, b'O' as u16, b'F' as u16, b'T' as u16, b'W' as u16, b'A' as u16, b'R' as u16,
    b'E' as u16, b'\\' as u16, b'M' as u16, b'i' as u16, b'c' as u16, b'r' as u16, b'o' as u16,
    b's' as u16, b'o' as u16, b'f' as u16, b't' as u16, b'\\' as u16, b'C' as u16, b'r' as u16,
    b'y' as u16, b'p' as u16, b't' as u16, b'o' as u16, b'g' as u16, b'r' as u16, b'a' as u16,
    b'p' as u16, b'h' as u16, b'y' as u16, 0,
];

const MACHINE_GUID_VAL: &[u16] = &[
    b'M' as u16, b'a' as u16, b'c' as u16, b'h' as u16, b'i' as u16, b'n' as u16, b'e' as u16,
    b'G' as u16, b'u' as u16, b'i' as u16, b'd' as u16, 0,
];

fn read_windows_machine_guid() -> Option<String> {
    unsafe {
        let mut hkey: HKEY = std::mem::zeroed();
        let status = RegOpenKeyExW(
            HKEY_LOCAL_MACHINE,
            CRYPTO_SUBKEY.as_ptr(),
            0,
            KEY_READ | KEY_WOW64_64KEY,
            &mut hkey,
        );

        if status != 0 {
            return None;
        }

        let mut val_type: u32 = 0;
        let mut buf_size: u32 = 256;
        let mut buffer = vec![0u16; 128];

        let query_status = RegQueryValueExW(
            hkey,
            MACHINE_GUID_VAL.as_ptr(),
            std::ptr::null_mut(),
            &mut val_type,
            buffer.as_mut_ptr() as *mut u8,
            &mut buf_size,
        );

        RegCloseKey(hkey);

        if query_status == 0 && val_type == REG_SZ {
            let len = (buf_size / 2) as usize;
            let slice = if len > 0 && buffer[len - 1] == 0 {
                &buffer[..len - 1]
            } else {
                &buffer[..len]
            };
            OsString::from_wide(slice).into_string().ok()
        } else {
            None
        }
    }
}

pub fn get_raw_machine_identifier() -> String {
    if let Some(guid) = read_windows_machine_guid() {
        if !guid.trim().is_empty() {
            return guid.trim().to_lowercase();
        }
    }

    let comp = std::env::var("COMPUTERNAME").unwrap_or_else(|_| "UNKNOWN_HOST".into());
    let user = std::env::var("USERNAME").unwrap_or_else(|_| "DEFAULT_USER".into());
    let arch = std::env::consts::ARCH;
    format!("{}-{}-{}", comp, user, arch)
}

pub fn get_machine_id() -> String {
    let raw = get_raw_machine_identifier();
    let mut hasher = Sha256::new();
    hasher.update(b"nakraku:hwid:v1:");
    hasher.update(raw.as_bytes());
    let hash = hasher.finalize();

    let mut hex_str = String::with_capacity(64);
    for byte in hash {
        use std::fmt::Write;
        let _ = write!(&mut hex_str, "{:02x}", byte);
    }
    hex_str
}
