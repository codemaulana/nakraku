# Nakraku Stash — Browser Extension WebSocket Protocol Specification

## 1. Overview
The Nakraku Stash desktop application embeds a local WebSocket server listening strictly on loopback address `127.0.0.1:48123`. The Manifest V3 browser extension acts as a local WebSocket client to synchronize browser tabs during stash and restore operations without cloud telemetry or external network calls.

## 2. Network Endpoint
* **URI**: `ws://127.0.0.1:48123`
* **Transport**: WebSocket (RFC 6455)
* **Encoding**: UTF-8 JSON text frames
* **Security & Sandboxing**: Loopback interface only (`127.0.0.1`). External incoming connections are rejected.
* **Origin Validation**: Strict Origin header inspection during WebSocket handshake. Rejects any untrusted web origins with HTTP 403 Forbidden. Allowed origins: `chrome-extension://*`, `moz-extension://*`, or loopback clients without browser Origin headers.

---

## 3. Envelope Specification
Every message exchanged between the desktop application and the browser extension MUST adhere to the following JSON envelope:

```json
{
  "type": "MESSAGE_TYPE",
  "requestId": "uuid-v4-or-nanoid",
  "payload": {},
  "timestamp": 1700000000000
}
```

### Fields
| Field | Type | Description |
|---|---|---|
| `type` | string (enum) | Message identifier indicating the command or event |
| `requestId` | string | Unique correlation identifier for request-response pairing |
| `payload` | object / null | Strongly-typed message payload |
| `timestamp` | number (int) | Unix epoch millisecond timestamp |

---

## 4. Message Types & Workflows

### 4.1 Heartbeat / Keepalive
* **`PING`** (Desktop → Extension or Extension → Desktop):
  ```json
  { "type": "PING", "requestId": "req-1", "payload": null, "timestamp": 1700000000000 }
  ```
* **`PONG`** (Response):
  ```json
  { "type": "PONG", "requestId": "req-1", "payload": { "status": "ok" }, "timestamp": 1700000000010 }
  ```

### 4.2 Query Open Tabs (`GET_TABS`)
* **Request** (Desktop → Extension):
  ```json
  { "type": "GET_TABS", "requestId": "req-2", "payload": null, "timestamp": 1700000001000 }
  ```
* **Response `TABS_LIST`** (Extension → Desktop):
  ```json
  {
    "type": "TABS_LIST",
    "requestId": "req-2",
    "payload": {
      "tabs": [
        {
          "id": 101,
          "windowId": 1,
          "url": "https://github.com",
          "title": "GitHub",
          "favIconUrl": "https://github.githubassets.com/favicons/favicon.png",
          "active": true,
          "index": 0
        }
      ]
    },
    "timestamp": 1700000001050
  }
  ```

### 4.3 Stash Tabs (`STASH_TABS`)
* **Request** (Desktop → Extension):
  Instructs the extension to record and close all tracked browser tabs.
  ```json
  { "type": "STASH_TABS", "requestId": "req-3", "payload": { "closeTabs": true }, "timestamp": 1700000002000 }
  ```
* **Response `STASH_TABS_ACK`** (Extension → Desktop):
  Returns the exact list of tabs that were saved and closed.
  ```json
  {
    "type": "STASH_TABS_ACK",
    "requestId": "req-3",
    "payload": {
      "stashedCount": 5,
      "tabs": [...]
    },
    "timestamp": 1700000002100
  }
  ```

### 4.4 Restore Tabs (`RESTORE_TABS`)
* **Request** (Desktop → Extension):
  Instructs extension to reopen saved URLs into browser windows.
  ```json
  {
    "type": "RESTORE_TABS",
    "requestId": "req-4",
    "payload": {
      "tabs": [
        { "url": "https://crates.io", "title": "crates.io" },
        { "url": "https://tauri.app", "title": "Tauri" }
      ]
    },
    "timestamp": 1700000003000
  }
  ```
* **Response `RESTORE_TABS_ACK`** (Extension → Desktop):
  ```json
  {
    "type": "RESTORE_TABS_ACK",
    "requestId": "req-4",
    "payload": {
      "restoredCount": 2
    },
    "timestamp": 1700000003200
  }
  ```

---

## 5. Reconnection & Resilience Rules
1. **Exponential Backoff**: If disconnected, the extension reconnects after `1s, 2s, 4s, 8s, 16s` (capped at 5 retries before entering idle mode).
2. **Offline Fallback**: The extension maintains the last stashed tab list in `chrome.storage.local`.
3. **Heartbeat Interval**: 10-second ping/pong keepalive prevents service worker sleep in Chromium MV3.
