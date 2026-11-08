use super::error::OsError;
use super::types::{MemoryStats, ProcessInfo};
use std::mem;
use std::path::Path;
use windows_sys::Win32::Foundation::{CloseHandle, GetLastError, HANDLE};
use windows_sys::Win32::System::ProcessStatus::{K32GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS};
use windows_sys::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
use windows_sys::Win32::System::Threading::{
    OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32, PROCESS_QUERY_INFORMATION,
    PROCESS_QUERY_LIMITED_INFORMATION, PROCESS_VM_READ,
};

pub fn get_process_info(pid: u32) -> Result<ProcessInfo, OsError> {
    let mut is_elevated = false;
    let access = PROCESS_QUERY_INFORMATION | PROCESS_VM_READ;
    let handle = unsafe { OpenProcess(access, 0, pid) };

    let active_handle = if handle.is_null() {
        let err = unsafe { GetLastError() };
        if err == 5 {
            is_elevated = true;
            let limited = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid) };
            if limited.is_null() {
                return Ok(ProcessInfo {
                    pid,
                    name: format!("PID:{pid}"),
                    exe_path: None,
                    ram_bytes: 0,
                    is_elevated: true,
                });
            }
            limited
        } else {
            return Err(OsError::ProcessOpenFailed(pid, err));
        }
    } else {
        handle
    };

    let exe_path = query_process_path(active_handle);
    let ram_bytes = query_memory_bytes(active_handle);

    unsafe {
        CloseHandle(active_handle);
    }

    let name = exe_path
        .as_ref()
        .and_then(|p| {
            Path::new(p)
                .file_name()
                .map(|f| f.to_string_lossy().to_string())
        })
        .unwrap_or_else(|| format!("PID:{pid}"));

    Ok(ProcessInfo {
        pid,
        name,
        exe_path,
        ram_bytes,
        is_elevated,
    })
}

fn query_process_path(handle: HANDLE) -> Option<String> {
    let mut buffer = [0u16; 1024];
    let mut size = buffer.len() as u32;
    let success = unsafe {
        QueryFullProcessImageNameW(handle, PROCESS_NAME_WIN32, buffer.as_mut_ptr(), &mut size)
    };
    if success != 0 && size > 0 {
        Some(String::from_utf16_lossy(&buffer[..size as usize]))
    } else {
        None
    }
}

pub fn query_memory_bytes(handle: HANDLE) -> u64 {
    let mut counters: PROCESS_MEMORY_COUNTERS = unsafe { mem::zeroed() };
    let size = mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32;
    counters.cb = size;
    let ok = unsafe { K32GetProcessMemoryInfo(handle, &mut counters, size) };
    if ok != 0 {
        counters.WorkingSetSize as u64
    } else {
        0
    }
}

pub fn get_system_memory_stats() -> Result<MemoryStats, OsError> {
    let mut mem_status: MEMORYSTATUSEX = unsafe { mem::zeroed() };
    mem_status.dwLength = mem::size_of::<MEMORYSTATUSEX>() as u32;

    let ok = unsafe { GlobalMemoryStatusEx(&mut mem_status) };
    if ok == 0 {
        let err = unsafe { GetLastError() };
        return Err(OsError::MemoryQueryFailed(0, err));
    }

    let total = mem_status.ullTotalPhys;
    let avail = mem_status.ullAvailPhys;
    let used = if total > avail { total - avail } else { 0 };

    Ok(MemoryStats {
        total_ram_bytes: total,
        used_ram_bytes: used,
        available_ram_bytes: avail,
        memory_load_percentage: mem_status.dwMemoryLoad,
    })
}
