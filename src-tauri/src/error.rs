use std::fmt;

/// Top-level strongly typed application error enum for Tauri IPC and native subsystems.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(tag = "type", content = "details")]
pub enum AppError {
    /// Database query or connection pool failure.
    Db(String),
    /// Win32 OS API or process interaction failure.
    Os(String),
    /// Core business logic or workspace orchestration failure.
    Core(String),
    /// Offline cryptographic license verification failure.
    License(String),
    /// Loopback WebSocket protocol or client transmission failure.
    Ws(String),
    /// Input schema or boundary constraint validation failure.
    Validation(String),
    /// Internal application state or IO error.
    Internal(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Db(msg) => write!(f, "Database error: {msg}"),
            AppError::Os(msg) => write!(f, "Win32 OS error: {msg}"),
            AppError::Core(msg) => write!(f, "Core logic error: {msg}"),
            AppError::License(msg) => write!(f, "License error: {msg}"),
            AppError::Ws(msg) => write!(f, "WebSocket bridge error: {msg}"),
            AppError::Validation(msg) => write!(f, "Validation error: {msg}"),
            AppError::Internal(msg) => write!(f, "Internal application error: {msg}"),
        }
    }
}

impl std::error::Error for AppError {}

impl From<crate::db::DbError> for AppError {
    fn from(err: crate::db::DbError) -> Self {
        AppError::Db(err.to_string())
    }
}

impl From<crate::os::error::OsError> for AppError {
    fn from(err: crate::os::error::OsError) -> Self {
        AppError::Os(err.to_string())
    }
}

impl From<crate::core::error::CoreError> for AppError {
    fn from(err: crate::core::error::CoreError) -> Self {
        AppError::Core(err.to_string())
    }
}

impl From<crate::license::error::LicenseError> for AppError {
    fn from(err: crate::license::error::LicenseError) -> Self {
        AppError::License(err.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Internal(err.to_string())
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::Db(err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_error_serialization() -> Result<(), Box<dyn std::error::Error>> {
        let err = AppError::Db("Connection reset".to_string());
        let json = serde_json::to_string(&err)?;
        assert_eq!(json, r#"{"type":"Db","details":"Connection reset"}"#);

        let deserialized: AppError = serde_json::from_str(&json)?;
        assert_eq!(deserialized, err);
        Ok(())
    }

    #[test]
    fn test_app_error_display() {
        let os_err = AppError::Os("Access denied".to_string());
        assert_eq!(os_err.to_string(), "Win32 OS error: Access denied");

        let lic_err = AppError::License("Key expired".to_string());
        assert_eq!(lic_err.to_string(), "License error: Key expired");
    }

    #[test]
    fn test_app_error_from_conversions() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let app_err = AppError::from(io_err);
        assert!(matches!(app_err, AppError::Internal(_)));
        assert!(app_err.to_string().contains("file not found"));
    }
}
