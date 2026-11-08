pub mod commands;
pub mod error;
pub mod server;
pub mod types;

pub use error::WsError;
pub use server::{run_ws_server, WsServer, WS_ADDR, WS_PORT};
pub use types::{WsMessageEnvelope, WsStatusPayload, WsTabItem};

pub fn init_ws_server() -> WsServer {
    let server = WsServer::new();
    let server_clone = server.clone();

    tokio::spawn(async move {
        if let Err(e) = run_ws_server(server_clone, WS_ADDR).await {
            log::warn!("WebSocket server stopped or failed to bind: {}", e);
        }
    });

    server
}

#[cfg(test)]
mod tests {
    use super::*;
    use futures_util::{SinkExt, StreamExt};
    use tokio_tungstenite::connect_async;
    use tokio_tungstenite::tungstenite::Message;

    #[tokio::test]
    async fn test_ws_handshake_and_ping() -> Result<(), Box<dyn std::error::Error>> {
        let server = WsServer::new();
        let test_addr = "127.0.0.1:48199";
        let server_clone = server.clone();

        tokio::spawn(async move {
            let _ = run_ws_server(server_clone, test_addr).await;
        });

        tokio::time::sleep(std::time::Duration::from_millis(50)).await;

        let url = format!("ws://{}", test_addr);
        let (ws_stream, _) = connect_async(&url).await?;
        let (mut write, mut read) = ws_stream.split();

        let ping_env: WsMessageEnvelope<Option<()>> = WsMessageEnvelope::new("PING", "test-ping-1", None);
        let ping_json = serde_json::to_string(&ping_env)?;
        write.send(Message::Text(ping_json.into())).await?;

        if let Some(Ok(Message::Text(resp_text))) = read.next().await {
            let parsed: serde_json::Value = serde_json::from_str(&resp_text)?;
            assert_eq!(parsed["type"], "PONG");
            assert_eq!(parsed["requestId"], "test-ping-1");
        } else {
            panic!("Expected PONG response from WebSocket server");
        }

        Ok(())
    }

    #[tokio::test]
    async fn test_ws_protocol_tabs_roundtrip() -> Result<(), Box<dyn std::error::Error>> {
        let server = WsServer::new();
        let test_addr = "127.0.0.1:48198";
        let server_clone = server.clone();

        tokio::spawn(async move {
            let _ = run_ws_server(server_clone, test_addr).await;
        });

        tokio::time::sleep(std::time::Duration::from_millis(50)).await;

        let url = format!("ws://{}", test_addr);
        let (ws_stream, _) = connect_async(&url).await?;
        let (mut write, _) = ws_stream.split();

        let tabs = vec![WsTabItem {
            id: Some(1),
            window_id: Some(1),
            url: "https://github.com".into(),
            title: "GitHub".into(),
            fav_icon_url: None,
            active: Some(true),
            index: Some(0),
        }];

        let payload = types::WsTabsPayload { tabs };
        let env = WsMessageEnvelope::new("TABS_LIST", "test-tabs-1", Some(payload));
        let json = serde_json::to_string(&env)?;
        write.send(Message::Text(json.into())).await?;

        tokio::time::sleep(std::time::Duration::from_millis(50)).await;

        let cached = server.get_cached_tabs()?;
        assert_eq!(cached.len(), 1);
        assert_eq!(cached[0].url, "https://github.com");

        Ok(())
    }
}
