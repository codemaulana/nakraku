use super::DbError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TabRecord {
    pub id: String,
    pub window_id: String,
    pub session_id: String,
    pub url: String,
    pub title: String,
    pub fav_icon_url: Option<String>,
    pub tab_index: i32,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InsertTabInput {
    pub id: String,
    pub window_id: String,
    pub session_id: String,
    pub url: String,
    pub title: String,
    pub fav_icon_url: Option<String>,
    pub tab_index: i32,
    pub is_active: bool,
}

pub fn upsert_tabs(conn: &mut Connection, tabs: &[InsertTabInput]) -> Result<usize, DbError> {
    let tx = conn.transaction()?;
    let mut count = 0;

    {
        let mut stmt = tx.prepare(
            "INSERT INTO tabs (
                id, window_id, session_id, url, title, fav_icon_url, tab_index, is_active
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            ON CONFLICT(id) DO UPDATE SET
                url = excluded.url,
                title = excluded.title,
                fav_icon_url = excluded.fav_icon_url,
                tab_index = excluded.tab_index,
                is_active = excluded.is_active",
        )?;

        for t in tabs {
            stmt.execute(params![
                t.id,
                t.window_id,
                t.session_id,
                t.url,
                t.title,
                t.fav_icon_url,
                t.tab_index,
                if t.is_active { 1 } else { 0 }
            ])?;
            count += 1;
        }
    }

    tx.commit()?;
    Ok(count)
}

pub fn list_by_window(conn: &Connection, window_id: &str) -> Result<Vec<TabRecord>, DbError> {
    let mut stmt = conn.prepare(
        "SELECT id, window_id, session_id, url, title, fav_icon_url, tab_index, is_active
         FROM tabs
         WHERE window_id = ?1
         ORDER BY tab_index ASC",
    )?;

    let records = stmt
        .query_map([window_id], |row| {
            let is_act: i32 = row.get(7)?;
            Ok(TabRecord {
                id: row.get(0)?,
                window_id: row.get(1)?,
                session_id: row.get(2)?,
                url: row.get(3)?,
                title: row.get(4)?,
                fav_icon_url: row.get(5)?,
                tab_index: row.get(6)?,
                is_active: is_act == 1,
            })
        })?
        .filter_map(Result::ok)
        .collect();

    Ok(records)
}

pub fn delete_by_session(conn: &Connection, session_id: &str) -> Result<usize, DbError> {
    let rows = conn.execute("DELETE FROM tabs WHERE session_id = ?1", [session_id])?;
    Ok(rows)
}
