use serde::Serialize;
use std::fmt;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum CoreError {
    WorkspaceLimitExceeded(usize),
    InvalidWorkspaceName(String),
    WorkspaceNotFound(String),
    SessionNotFound(String),
    NothingToUndo,
    DbError(String),
    OsError(String),
    LockError(String),
}

impl fmt::Display for CoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::WorkspaceLimitExceeded(max) => {
                write!(f, "Free tier limit of {max} workspaces reached. Upgrade to Pro for unlimited workspaces.")
            }
            Self::InvalidWorkspaceName(msg) => write!(f, "Invalid workspace name: {msg}"),
            Self::WorkspaceNotFound(id) => write!(f, "Workspace '{id}' not found"),
            Self::SessionNotFound(id) => write!(f, "Session '{id}' not found"),
            Self::NothingToUndo => write!(f, "No stash operations in undo stack"),
            Self::DbError(err) => write!(f, "Database error: {err}"),
            Self::OsError(err) => write!(f, "OS operation failed: {err}"),
            Self::LockError(err) => write!(f, "Lock acquisition error: {err}"),
        }
    }
}

impl std::error::Error for CoreError {}
