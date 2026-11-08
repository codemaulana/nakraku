use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LicenseError {
    InvalidFormat(String),
    InvalidBase64(String),
    InvalidSignature,
    MachineIdMismatch { expected: String, actual: String },
    Expired { expires_at: i64, current_time: i64 },
    StoreError(String),
    DbError(String),
    OsError(String),
}

impl fmt::Display for LicenseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidFormat(msg) => write!(f, "Invalid license key format: {}", msg),
            Self::InvalidBase64(msg) => write!(f, "Base64 decode error: {}", msg),
            Self::InvalidSignature => write!(f, "Cryptographic signature verification failed"),
            Self::MachineIdMismatch { expected, actual } => {
                write!(f, "Machine ID mismatch. Key bound to {}, current system is {}", expected, actual)
            }
            Self::Expired { expires_at, current_time } => {
                write!(f, "License expired at {} (current time: {})", expires_at, current_time)
            }
            Self::StoreError(msg) => write!(f, "License storage error: {}", msg),
            Self::DbError(msg) => write!(f, "Database error: {}", msg),
            Self::OsError(msg) => write!(f, "OS telemetry error: {}", msg),
        }
    }
}

impl std::error::Error for LicenseError {}

impl serde::Serialize for LicenseError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
