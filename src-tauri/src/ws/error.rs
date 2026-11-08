use serde::Serialize;

#[derive(Debug)]
pub enum WsError {
    NoClientConnected,
    Io(String),
    Protocol(String),
    Serialization(String),
    LockError,
}

impl std::fmt::Display for WsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NoClientConnected => write!(f, "No browser extension connected to WebSocket bridge"),
            Self::Io(msg) => write!(f, "WebSocket IO error: {}", msg),
            Self::Protocol(msg) => write!(f, "WebSocket protocol violation: {}", msg),
            Self::Serialization(msg) => write!(f, "WebSocket serialization error: {}", msg),
            Self::LockError => write!(f, "WebSocket server state lock poisoned"),
        }
    }
}

impl std::error::Error for WsError {}

impl Serialize for WsError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
