use super::DbError;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WorkspaceRecord {
    pub id: String,
    pub name: String,
    pub color: String,
    pub icon: Option<String>,
    pub sort_order: i32,
    pub is_active: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWorkspaceInput {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub icon: Option<String>,
}

pub fn create(conn: &Connection, input: CreateWorkspaceInput) -> Result<WorkspaceRecord, DbError> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    let max_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), -1) + 1 FROM workspaces",
            [],
            |r| r.get(0),
        )
        .unwrap_or(0);

    let color = input.color.unwrap_or_else(|| "#10B981".to_string());
    let icon = input.icon.unwrap_or_else(|| "workspace".to_string());

    conn.execute(
        "INSERT INTO workspaces (id, name, color, icon, sort_order, is_active, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7)",
        params![input.id, input.name, color, icon, max_order, now, now],
    )?;

    get(conn, &input.id)
}

pub fn list(conn: &Connection) -> Result<Vec<WorkspaceRecord>, DbError> {
    let mut stmt = conn.prepare(
        "SELECT id, name, color, icon, sort_order, is_active, created_at, updated_at
         FROM workspaces
         ORDER BY sort_order ASC, created_at ASC",
    )?;

    let records = stmt
        .query_map([], |row| {
            let is_active_int: i32 = row.get(5)?;
            Ok(WorkspaceRecord {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                icon: row.get(3)?,
                sort_order: row.get(4)?,
                is_active: is_active_int == 1,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?
        .filter_map(Result::ok)
        .collect();

    Ok(records)
}

pub fn get(conn: &Connection, id: &str) -> Result<WorkspaceRecord, DbError> {
    conn.query_row(
        "SELECT id, name, color, icon, sort_order, is_active, created_at, updated_at
         FROM workspaces
         WHERE id = ?1",
        [id],
        |row| {
            let is_active_int: i32 = row.get(5)?;
            Ok(WorkspaceRecord {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                icon: row.get(3)?,
                sort_order: row.get(4)?,
                is_active: is_active_int == 1,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => {
            DbError::NotFound(format!("Workspace with id '{}' not found", id))
        }
        other => DbError::Sqlite(other),
    })
}

pub fn rename(conn: &Connection, id: &str, new_name: &str) -> Result<WorkspaceRecord, DbError> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    let rows = conn.execute(
        "UPDATE workspaces SET name = ?1, updated_at = ?2 WHERE id = ?3",
        params![new_name, now, id],
    )?;

    if rows == 0 {
        return Err(DbError::NotFound(format!("Workspace '{}' not found", id)));
    }

    get(conn, id)
}

pub fn delete(conn: &Connection, id: &str) -> Result<bool, DbError> {
    let rows = conn.execute("DELETE FROM workspaces WHERE id = ?1", [id])?;
    Ok(rows > 0)
}

pub fn reorder(conn: &Connection, ids_in_order: &[String]) -> Result<(), DbError> {
    let mut stmt = conn.prepare("UPDATE workspaces SET sort_order = ?1 WHERE id = ?2")?;
    for (idx, id) in ids_in_order.iter().enumerate() {
        stmt.execute(params![idx as i32, id])?;
    }
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
    fn test_workspace_crud() -> Result<(), Box<dyn std::error::Error>> {
        let conn = setup_test_db()?;
        let ws = create(
            &conn,
            CreateWorkspaceInput {
                id: "ws-1".to_string(),
                name: "Development".to_string(),
                color: Some("#10B981".to_string()),
                icon: Some("workspace".to_string()),
            },
        )?;

        assert_eq!(ws.id, "ws-1");
        assert_eq!(ws.name, "Development");

        let fetched = get(&conn, "ws-1")?;
        assert_eq!(fetched.name, "Development");

        let updated = rename(&conn, "ws-1", "Coding Engine")?;
        assert_eq!(updated.name, "Coding Engine");

        let list_all = list(&conn)?;
        assert_eq!(list_all.len(), 1);

        let deleted = delete(&conn, "ws-1")?;
        assert!(deleted);
        assert!(get(&conn, "ws-1").is_err());
        Ok(())
    }
}
