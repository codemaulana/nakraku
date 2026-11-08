use super::{get_db_path, DbError};
use std::fs;
use tauri::AppHandle;

pub fn backup_db(app: &AppHandle) -> Result<String, DbError> {
    let db_path = get_db_path(app).map_err(|e| DbError::Io(e))?;
    if !db_path.exists() {
        return Err(DbError::NotFound("Database file does not exist to backup".into()));
    }

    let backup_path = db_path.with_extension("db.bak");
    fs::copy(&db_path, &backup_path)
        .map_err(|e| DbError::Io(format!("Failed to copy DB backup: {}", e)))?;

    Ok(backup_path.to_string_lossy().to_string())
}
