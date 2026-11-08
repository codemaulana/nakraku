use super::DbError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SessionRecord {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub window_count: i32,
    pub ram_saved_bytes: i64,
    pub is_frozen: bool,
    pub snapshot_at: i64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSessionInput {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub window_count: i32,
    pub ram_saved_bytes: i64,
    pub is_frozen: bool,
}

pub fn save_session(conn: &Connection, input: CreateSessionInput) -> Result<SessionRecord, DbError> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    conn.execute(
        "INSERT INTO sessions (id, workspace_id, name, window_count, ram_saved_bytes, is_frozen, snapshot_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            input.id,
            input.workspace_id,
            input.name,
            input.window_count,
            input.ram_saved_bytes,
            if input.is_frozen { 1 } else { 0 },
            now,
            now
        ],
    )?;

    get_session(conn, &input.id)
}

pub fn list_sessions(conn: &Connection, workspace_id: &str) -> Result<Vec<SessionRecord>, DbError> {
    let mut stmt = conn.prepare(
        "SELECT id, workspace_id, name, window_count, ram_saved_bytes, is_frozen, snapshot_at, created_at
         FROM sessions
         WHERE workspace_id = ?1
         ORDER BY created_at DESC",
    )?;

    let records = stmt
        .query_map([workspace_id], |row| {
            let is_frozen_int: i32 = row.get(5)?;
            Ok(SessionRecord {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                name: row.get(2)?,
                window_count: row.get(3)?,
                ram_saved_bytes: row.get(4)?,
                is_frozen: is_frozen_int == 1,
                snapshot_at: row.get(6)?,
                created_at: row.get(7)?,
            })
        })?
        .filter_map(Result::ok)
        .collect();

    Ok(records)
}

pub fn get_session(conn: &Connection, id: &str) -> Result<SessionRecord, DbError> {
    conn.query_row(
        "SELECT id, workspace_id, name, window_count, ram_saved_bytes, is_frozen, snapshot_at, created_at
         FROM sessions
         WHERE id = ?1",
        [id],
        |row| {
            let is_frozen_int: i32 = row.get(5)?;
            Ok(SessionRecord {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                name: row.get(2)?,
                window_count: row.get(3)?,
                ram_saved_bytes: row.get(4)?,
                is_frozen: is_frozen_int == 1,
                snapshot_at: row.get(6)?,
                created_at: row.get(7)?,
            })
        },
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => {
            DbError::NotFound(format!("Session with id '{}' not found", id))
        }
        other => DbError::Sqlite(other),
    })
}

pub fn delete_session(conn: &Connection, id: &str) -> Result<bool, DbError> {
    let rows = conn.execute("DELETE FROM sessions WHERE id = ?1", [id])?;
    Ok(rows > 0)
}

pub fn purge_all_sessions(conn: &Connection) -> Result<usize, DbError> {
    let rows = conn.execute("DELETE FROM sessions", [])?;
    Ok(rows)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{init_connection, run_migrations, workspace_repo};

    fn setup_test_db() -> Result<Connection, Box<dyn std::error::Error>> {
        let mut conn = Connection::open_in_memory()?;
        init_connection(&mut conn)?;
        run_migrations(&mut conn)?;
        Ok(conn)
    }

    #[test]
    fn test_session_lifecycle() -> Result<(), Box<dyn std::error::Error>> {
        let conn = setup_test_db()?;
        workspace_repo::create(
            &conn,
            workspace_repo::CreateWorkspaceInput {
                id: "ws-1".into(),
                name: "Test WS".into(),
                color: None,
                icon: None,
            },
        )?;

        let session = save_session(
            &conn,
            CreateSessionInput {
                id: "sess-1".into(),
                workspace_id: "ws-1".into(),
                name: "Morning Stash".into(),
                window_count: 5,
                ram_saved_bytes: 1024 * 1024 * 500,
                is_frozen: true,
            },
        )?;

        assert_eq!(session.id, "sess-1");
        assert_eq!(session.window_count, 5);

        let list = list_sessions(&conn, "ws-1")?;
        assert_eq!(list.len(), 1);

        let fetched = get_session(&conn, "sess-1")?;
        assert_eq!(fetched.name, "Morning Stash");

        let deleted = delete_session(&conn, "sess-1")?;
        assert!(deleted);
        assert!(get_session(&conn, "sess-1").is_err());
        Ok(())
    }

    #[test]
    fn test_purge_all_sessions() -> Result<(), Box<dyn std::error::Error>> {
        let conn = setup_test_db()?;
        workspace_repo::create(
            &conn,
            workspace_repo::CreateWorkspaceInput {
                id: "ws-1".into(),
                name: "Purge Test WS".into(),
                color: None,
                icon: None,
            },
        )?;

        save_session(
            &conn,
            CreateSessionInput {
                id: "sess-1".into(),
                workspace_id: "ws-1".into(),
                name: "Session 1".into(),
                window_count: 2,
                ram_saved_bytes: 100,
                is_frozen: true,
            },
        )?;
        save_session(
            &conn,
            CreateSessionInput {
                id: "sess-2".into(),
                workspace_id: "ws-1".into(),
                name: "Session 2".into(),
                window_count: 3,
                ram_saved_bytes: 200,
                is_frozen: true,
            },
        )?;

        assert_eq!(list_sessions(&conn, "ws-1")?.len(), 2);
        let purged = purge_all_sessions(&conn)?;
        assert_eq!(purged, 2);
        assert_eq!(list_sessions(&conn, "ws-1")?.len(), 0);
        Ok(())
    }
}
