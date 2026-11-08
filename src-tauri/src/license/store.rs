use super::error::LicenseError;
use crate::db::settings_repo::{get_setting, set_setting};
use crate::db::DbPool;
use keyring::Entry;

const SERVICE_NAME: &str = "nakraku-stash";
const USERNAME: &str = "license_key";
const DB_FALLBACK_KEY: &str = "license_key_stored";

pub fn save_license_key(key: &str, pool: Option<&DbPool>) -> Result<(), LicenseError> {
    let entry = Entry::new(SERVICE_NAME, USERNAME);
    let mut keyring_succeeded = false;

    if let Ok(e) = entry {
        if e.set_password(key).is_ok() {
            keyring_succeeded = true;
        }
    }

    if let Some(p) = pool {
        let lock = p
            .lock()
            .map_err(|e| LicenseError::StoreError(format!("DB lock error: {}", e)))?;
        set_setting(&lock, DB_FALLBACK_KEY, key)
            .map_err(|e| LicenseError::DbError(e.to_string()))?;
        return Ok(());
    }

    if keyring_succeeded {
        Ok(())
    } else {
        Err(LicenseError::StoreError("Failed to store license key in OS keyring or database".into()))
    }
}

pub fn load_license_key(pool: Option<&DbPool>) -> Result<Option<String>, LicenseError> {
    if let Ok(entry) = Entry::new(SERVICE_NAME, USERNAME) {
        if let Ok(pwd) = entry.get_password() {
            if !pwd.trim().is_empty() {
                return Ok(Some(pwd.trim().to_string()));
            }
        }
    }

    if let Some(p) = pool {
        let lock = p
            .lock()
            .map_err(|e| LicenseError::StoreError(format!("DB lock error: {}", e)))?;
        let stored = get_setting(&lock, DB_FALLBACK_KEY)
            .map_err(|e| LicenseError::DbError(e.to_string()))?;
        return Ok(stored);
    }

    Ok(None)
}

pub fn delete_license_key(pool: Option<&DbPool>) -> Result<(), LicenseError> {
    if let Ok(entry) = Entry::new(SERVICE_NAME, USERNAME) {
        let _ = entry.delete_credential();
    }

    if let Some(p) = pool {
        let lock = p
            .lock()
            .map_err(|e| LicenseError::StoreError(format!("DB lock error: {}", e)))?;
        let _ = set_setting(&lock, DB_FALLBACK_KEY, "");
    }

    Ok(())
}
