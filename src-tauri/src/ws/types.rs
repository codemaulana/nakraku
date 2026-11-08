use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WsTabItem {
    pub id: Option<i64>,
    pub window_id: Option<i64>,
    pub url: String,
    pub title: String,
    pub fav_icon_url: Option<String>,
    pub active: Option<bool>,
    pub index: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WsMessageEnvelope<T> {
    pub r#type: String,
    #[serde(rename = "requestId")]
    pub request_id: String,
    pub payload: Option<T>,
    pub timestamp: i64,
}

impl<T> WsMessageEnvelope<T> {
    pub fn new(msg_type: &str, request_id: &str, payload: Option<T>) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as i64)
            .unwrap_or(0);

        Self {
            r#type: msg_type.to_string(),
            request_id: request_id.to_string(),
            payload,
            timestamp: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WsTabsPayload {
    pub tabs: Vec<WsTabItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WsStashTabsAckPayload {
    #[serde(rename = "stashedCount")]
    pub stashed_count: usize,
    pub tabs: Vec<WsTabItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WsRestoreTabsAckPayload {
    #[serde(rename = "restoredCount")]
    pub restored_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WsStatusPayload {
    pub connected: bool,
    pub client_count: usize,
    pub port: u16,
}
