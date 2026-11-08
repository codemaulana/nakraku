use super::error::LicenseError;
use super::machine_id::get_machine_id;
use super::store::{delete_license_key, load_license_key, save_license_key};
use super::types::LicenseStatus;
use super::verifier::{verify_license_offline, LICENSE_PUBLIC_KEY_HEX};
use crate::db::DbPool;
use tauri::State;

#[tauri::command]
pub fn cmd_get_machine_id() -> Result<String, LicenseError> {
    Ok(get_machine_id())
}

#[tauri::command]
pub fn cmd_get_license_status(pool: State<DbPool>) -> Result<LicenseStatus, LicenseError> {
    let mid = get_machine_id();
    if let Ok(Some(key)) = load_license_key(Some(&pool)) {
        if let Ok(status) = verify_license_offline(&key, &mid, LICENSE_PUBLIC_KEY_HEX) {
            return Ok(status);
        }
    }
    Ok(LicenseStatus::free(mid))
}

#[tauri::command]
pub fn cmd_activate_license(
    pool: State<DbPool>,
    license_key: String,
) -> Result<LicenseStatus, LicenseError> {
    let mid = get_machine_id();
    let status = verify_license_offline(&license_key, &mid, LICENSE_PUBLIC_KEY_HEX)?;
    save_license_key(&license_key, Some(&pool))?;
    Ok(status)
}

#[tauri::command]
pub fn cmd_deactivate_license(pool: State<DbPool>) -> Result<LicenseStatus, LicenseError> {
    delete_license_key(Some(&pool))?;
    let mid = get_machine_id();
    Ok(LicenseStatus::free(mid))
}
