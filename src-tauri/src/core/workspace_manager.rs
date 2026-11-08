use super::error::CoreError;
use crate::db::{settings_repo, workspace_repo};
use rusqlite::Connection;

pub const FREE_TIER_WORKSPACE_LIMIT: usize = 3;

pub fn validate_workspace_name(name: &str, existing_names: &[String]) -> Result<String, CoreError> {
    let trimmed = name.trim();
    if trimmed.chars().count() < 2 {
        return Err(CoreError::InvalidWorkspaceName(
            "Workspace name must be at least 2 characters long".to_string(),
        ));
    }
    if trimmed.chars().count() > 40 {
        return Err(CoreError::InvalidWorkspaceName(
            "Workspace name cannot exceed 40 characters".to_string(),
        ));
    }

    let lower = trimmed.to_lowercase();
    if existing_names.iter().any(|n| n.trim().to_lowercase() == lower) {
        return Err(CoreError::InvalidWorkspaceName(format!(
            "A workspace named '{trimmed}' already exists"
        )));
    }

    Ok(trimmed.to_string())
}

pub fn check_workspace_limit(conn: &Connection) -> Result<(), CoreError> {
    let license = settings_repo::get_setting(conn, "license_tier")
        .map_err(|e| CoreError::DbError(e.to_string()))?
        .unwrap_or_else(|| "free".to_string());

    if license.to_lowercase() == "pro" {
        return Ok(());
    }

    let existing = workspace_repo::list(conn)
        .map_err(|e| CoreError::DbError(e.to_string()))?;

    if existing.len() >= FREE_TIER_WORKSPACE_LIMIT {
        return Err(CoreError::WorkspaceLimitExceeded(FREE_TIER_WORKSPACE_LIMIT));
    }

    Ok(())
}

pub fn reorder_workspaces(conn: &Connection, ordered_ids: &[String]) -> Result<(), CoreError> {
    workspace_repo::reorder(conn, ordered_ids)
        .map_err(|e| CoreError::DbError(e.to_string()))
}
