use super::DbError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SettingRecord {
    pub key: String,
    pub value: String,
    pub updated_at: i64,
}

pub fn get_setting(conn: &Connection, key: &str) -> Result<Option<String>, DbError> {
    let mut stmt = conn.prepare("SELECT value FROM app_settings WHERE key = ?1")?;
    let mut rows = stmt.query([key])?;

    if let Some(row) = rows.next()? {
        let val: String = row.get(0)?;
        Ok(Some(val))
    } else {
        Ok(None)
    }
}

pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<(), DbError> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    conn.execute(
        "INSERT INTO app_settings (key, value, updated_at)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET
             value = excluded.value,
             updated_at = excluded.updated_at",
        params![key, value, now],
    )?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{init_connection, run_migrations};

    fn setup_test_db() -> Result<Connection, Box<dyn std::error::Error>> {
        let mut conn = Connection::open_in_memory()?;
        init_connection(&mut conn)?;
        run_migrations(&mut conn)?;
        Ok(conn)
    }

    #[test]
    fn test_settings_roundtrip() -> Result<(), Box<dyn std::error::Error>> {
        let conn = setup_test_db()?;
        assert!(get_setting(&conn, "autostart")?.is_none());

        set_setting(&conn, "autostart", "true")?;
        assert_eq!(get_setting(&conn, "autostart")?.as_deref(), Some("true"));

        set_setting(&conn, "autostart", "false")?;
        assert_eq!(get_setting(&conn, "autostart")?.as_deref(), Some("false"));
        Ok(())
    }
}
