use super::error::WsError;
use super::types::{WsMessageEnvelope, WsStatusPayload, WsTabItem, WsTabsPayload};
use futures_util::{SinkExt, StreamExt};
use serde_json::Value;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio_tungstenite::tungstenite::Message;

use tokio_tungstenite::tungstenite::handshake::server::{ErrorResponse, Request, Response};
use tokio_tungstenite::tungstenite::http::StatusCode;

pub const WS_PORT: u16 = 48123;
pub const WS_ADDR: &str = "127.0.0.1:48123";

pub fn is_allowed_origin(origin: &str) -> bool {
    let lower = origin.to_lowercase();
    lower.starts_with("chrome-extension://")
        || lower.starts_with("moz-extension://")
        || lower.starts_with("edge://")
        || lower.starts_with("http://localhost")
        || lower.starts_with("http://127.0.0.1")
        || lower.starts_with("https://tauri.localhost")
        || lower.starts_with("tauri://localhost")
}

#[derive(Debug, Default)]
pub struct WsServerInner {
    pub client_count: usize,
    pub latest_tabs: Vec<WsTabItem>,
    pub last_stashed_tabs: Vec<WsTabItem>,
}

#[derive(Clone)]
pub struct WsServer {
    pub inner: Arc<Mutex<WsServerInner>>,
    pub outgoing_tx: broadcast::Sender<String>,
}

impl Default for WsServer {
    fn default() -> Self {
        Self::new()
    }
}

impl WsServer {
    pub fn new() -> Self {
        let (tx, _rx) = broadcast::channel(32);
        Self {
            inner: Arc::new(Mutex::new(WsServerInner::default())),
            outgoing_tx: tx,
        }
    }

    pub fn get_status(&self) -> Result<WsStatusPayload, WsError> {
        let lock = self.inner.lock().map_err(|_| WsError::LockError)?;
        Ok(WsStatusPayload {
            connected: lock.client_count > 0,
            client_count: lock.client_count,
            port: WS_PORT,
        })
    }

    pub fn get_cached_tabs(&self) -> Result<Vec<WsTabItem>, WsError> {
        let lock = self.inner.lock().map_err(|_| WsError::LockError)?;
        Ok(lock.latest_tabs.clone())
    }

    pub fn get_last_stashed(&self) -> Result<Vec<WsTabItem>, WsError> {
        let lock = self.inner.lock().map_err(|_| WsError::LockError)?;
        Ok(lock.last_stashed_tabs.clone())
    }

    pub fn broadcast_message<T: serde::Serialize>(&self, msg: &WsMessageEnvelope<T>) -> Result<(), WsError> {
        let serialized = serde_json::to_string(msg).map_err(|e| WsError::Serialization(e.to_string()))?;
        let _ = self.outgoing_tx.send(serialized);
        Ok(())
    }

    pub fn trigger_get_tabs(&self) -> Result<(), WsError> {
        let req_id = format!("req-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0));
        let env: WsMessageEnvelope<Option<()>> = WsMessageEnvelope::new("GET_TABS", &req_id, None);
        self.broadcast_message(&env)
    }

    pub fn trigger_stash_tabs(&self) -> Result<(), WsError> {
        let req_id = format!("stash-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0));
        let env: WsMessageEnvelope<Option<()>> = WsMessageEnvelope::new("STASH_TABS", &req_id, None);
        self.broadcast_message(&env)
    }

    pub fn trigger_restore_tabs(&self, tabs: Vec<WsTabItem>) -> Result<(), WsError> {
        let req_id = format!("restore-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0));
        let payload = WsTabsPayload { tabs };
        let env = WsMessageEnvelope::new("RESTORE_TABS", &req_id, Some(payload));
        self.broadcast_message(&env)
    }
}

pub async fn run_ws_server(server: WsServer, addr: &str) -> Result<(), String> {
    let listener = TcpListener::bind(addr)
        .await
        .map_err(|e| format!("Failed to bind WebSocket listener to {}: {}", addr, e))?;

    while let Ok((stream, peer)) = listener.accept().await {
        let server_clone = server.clone();
        tokio::spawn(async move {
            handle_ws_connection(stream, peer, server_clone).await;
        });
    }

    Ok(())
}

async fn handle_ws_connection(stream: TcpStream, _peer: SocketAddr, server: WsServer) {
    let callback = |req: &Request, response: Response| -> Result<Response, ErrorResponse> {
        if let Some(origin_header) = req.headers().get("Origin") {
            if let Ok(origin_str) = origin_header.to_str() {
                if !is_allowed_origin(origin_str) {
                    let mut err = ErrorResponse::new(Some("403 Forbidden: Untrusted Origin".into()));
                    *err.status_mut() = StatusCode::FORBIDDEN;
                    return Err(err);
                }
            }
        }
        Ok(response)
    };

    let ws_stream = match tokio_tungstenite::accept_hdr_async(stream, callback).await {
        Ok(ws) => ws,
        Err(_) => return,
    };

    if let Ok(mut lock) = server.inner.lock() {
        lock.client_count += 1;
    }

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let mut broadcast_rx = server.outgoing_tx.subscribe();

    loop {
        tokio::select! {
            msg = ws_receiver.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        process_incoming_message(&text, &server, &mut ws_sender).await;
                    }
                    Some(Ok(Message::Ping(data))) => {
                        let _ = ws_sender.send(Message::Pong(data)).await;
                    }
                    Some(Ok(Message::Close(_))) | None | Some(Err(_)) => {
                        break;
                    }
                    _ => {}
                }
            }
            outgoing = broadcast_rx.recv() => {
                if let Ok(text) = outgoing {
                    if ws_sender.send(Message::Text(text.into())).await.is_err() {
                        break;
                    }
                }
            }
        }
    }

    if let Ok(mut lock) = server.inner.lock() {
        lock.client_count = lock.client_count.saturating_sub(1);
    }
}

async fn process_incoming_message<S>(text: &str, server: &WsServer, ws_sender: &mut S)
where
    S: SinkExt<Message> + Unpin,
{
    let parsed: Value = match serde_json::from_str(text) {
        Ok(v) => v,
        Err(_) => return,
    };

    let msg_type = parsed.get("type").and_then(|v| v.as_str()).unwrap_or("");
    let req_id = parsed.get("requestId").and_then(|v| v.as_str()).unwrap_or("unknown");

    match msg_type {
        "PING" => {
            let pong = WsMessageEnvelope::new("PONG", req_id, Some(serde_json::json!({ "status": "ok" })));
            if let Ok(json) = serde_json::to_string(&pong) {
                let _ = ws_sender.send(Message::Text(json.into())).await;
            }
        }
        "TABS_LIST" => {
            if let Some(payload) = parsed.get("payload") {
                if let Ok(tabs_payload) = serde_json::from_value::<WsTabsPayload>(payload.clone()) {
                    if let Ok(mut lock) = server.inner.lock() {
                        lock.latest_tabs = tabs_payload.tabs;
                    }
                }
            }
        }
        "STASH_TABS_ACK" => {
            if let Some(payload) = parsed.get("payload") {
                if let Ok(ack) = serde_json::from_value::<super::types::WsStashTabsAckPayload>(payload.clone()) {
                    if let Ok(mut lock) = server.inner.lock() {
                        lock.last_stashed_tabs = ack.tabs;
                    }
                } else if let Ok(tabs_payload) = serde_json::from_value::<WsTabsPayload>(payload.clone()) {
                    if let Ok(mut lock) = server.inner.lock() {
                        lock.last_stashed_tabs = tabs_payload.tabs;
                    }
                }
            }
        }
        _ => {}
    }
}
