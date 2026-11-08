use super::DbError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WindowRecord {
    pub id: String,
    pub session_id: String,
    pub hwnd: String,
    pub process_id: u32,
    pub process_name: String,
    pub executable_path: Option<String>,
    pub title: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_minimized: bool,
    pub is_maximized: bool,
    pub ram_bytes: i64,
    pub z_order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InsertWindowInput {
    pub id: String,
    pub session_id: String,
    pub hwnd: String,
    pub process_id: u32,
    pub process_name: String,
    pub executable_path: Option<String>,
    pub title: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_minimized: bool,
    pub is_maximized: bool,
    pub ram_bytes: i64,
    pub z_order: i32,
}

pub fn upsert_windows(
    conn: &mut Connection,
    windows: &[InsertWindowInput],
) -> Result<usize, DbError> {
    let tx = conn.transaction()?;
    let mut count = 0;

    {
        let mut stmt = tx.prepare(
            "INSERT INTO windows (
                id, session_id, hwnd, process_id, process_name, executable_path,
                title, x, y, width, height, is_minimized, is_maximized, ram_bytes, z_order
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                x = excluded.x,
                y = excluded.y,
                width = excluded.width,
                height = excluded.height,
                is_minimized = excluded.is_minimized,
                is_maximized = excluded.is_maximized,
                ram_bytes = excluded.ram_bytes,
                z_order = excluded.z_order",
        )?;

        for w in windows {
            stmt.execute(params![
                w.id,
                w.session_id,
                w.hwnd,
                w.process_id,
                w.process_name,
                w.executable_path,
                w.title,
                w.x,
                w.y,
                w.width,
                w.height,
                if w.is_minimized { 1 } else { 0 },
                if w.is_maximized { 1 } else { 0 },
                w.ram_bytes,
                w.z_order
            ])?;
            count += 1;
        }
    }

    tx.commit()?;
    Ok(count)
}

pub fn list_by_session(conn: &Connection, session_id: &str) -> Result<Vec<WindowRecord>, DbError> {
    let mut stmt = conn.prepare(
        "SELECT id, session_id, hwnd, process_id, process_name, executable_path,
                title, x, y, width, height, is_minimized, is_maximized, ram_bytes, z_order
         FROM windows
         WHERE session_id = ?1
         ORDER BY z_order ASC",
    )?;

    let records = stmt
        .query_map([session_id], |row| {
            let is_min: i32 = row.get(11)?;
            let is_max: i32 = row.get(12)?;
            Ok(WindowRecord {
                id: row.get(0)?,
                session_id: row.get(1)?,
                hwnd: row.get(2)?,
                process_id: row.get(3)?,
                process_name: row.get(4)?,
                executable_path: row.get(5)?,
                title: row.get(6)?,
                x: row.get(7)?,
                y: row.get(8)?,
                width: row.get(9)?,
                height: row.get(10)?,
                is_minimized: is_min == 1,
                is_maximized: is_max == 1,
                ram_bytes: row.get(13)?,
                z_order: row.get(14)?,
            })
        })?
        .filter_map(Result::ok)
        .collect();

    Ok(records)
}

pub fn delete_by_session(conn: &Connection, session_id: &str) -> Result<usize, DbError> {
    let rows = conn.execute("DELETE FROM windows WHERE session_id = ?1", [session_id])?;
    Ok(rows)
}
