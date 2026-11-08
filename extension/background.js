const WS_URL = "ws://127.0.0.1:48123";
const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL_MS = 10000;

let socket = null;
let reconnectAttempts = 0;
let reconnectTimer = null;
let pingInterval = null;
let connectionState = "DISCONNECTED";

const formatTab = (tab) => ({
  id: tab.id,
  window_id: tab.windowId,
  url: tab.url || "",
  title: tab.title || "Untitled",
  fav_icon_url: tab.favIconUrl || null,
  active: tab.active,
  index: tab.index,
});

const sendWsEnvelope = (type, requestId, payload) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const envelope = {
    type,
    requestId,
    payload,
    timestamp: Date.now(),
  };
  socket.send(JSON.stringify(envelope));
};

const handleGetTabs = async (requestId) => {
  const tabs = await chrome.tabs.query({});
  const filtered = tabs
    .filter((t) => t.url && !t.url.startsWith("chrome://newtab"))
    .map(formatTab);
  sendWsEnvelope("TABS_LIST", requestId, { tabs: filtered });
};

const handleStashTabs = async (requestId) => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const actionable = tabs.filter((t) => t.url && !t.url.startsWith("chrome://"));
  const formatted = actionable.map(formatTab);

  await chrome.storage.local.set({
    nakraku_last_stashed: formatted,
    nakraku_last_stashed_at: Date.now(),
  });

  await chrome.tabs.create({ url: "chrome://newtab" });

  const idsToRemove = actionable.map((t) => t.id).filter(Boolean);
  if (idsToRemove.length > 0) {
    await chrome.tabs.remove(idsToRemove);
  }

  sendWsEnvelope("STASH_TABS_ACK", requestId, {
    stashedCount: formatted.length,
    tabs: formatted,
  });
};

const handleRestoreTabs = async (requestId, payload) => {
  const tabsToRestore = (payload && payload.tabs) || [];
  let count = 0;

  for (const tab of tabsToRestore) {
    if (tab.url && tab.url.startsWith("http")) {
      await chrome.tabs.create({ url: tab.url });
      count += 1;
    }
  }

  sendWsEnvelope("RESTORE_TABS_ACK", requestId, {
    restoredCount: count,
  });
};

const processServerMessage = async (event) => {
  try {
    const data = JSON.parse(event.data);
    const { type, requestId, payload } = data;

    switch (type) {
      case "PING":
        sendWsEnvelope("PONG", requestId, { status: "ok" });
        break;
      case "GET_TABS":
        await handleGetTabs(requestId);
        break;
      case "STASH_TABS":
        await handleStashTabs(requestId);
        break;
      case "RESTORE_TABS":
        await handleRestoreTabs(requestId, payload);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[Nakraku WS] Failed to parse message:", err);
  }
};

const connectWebSocket = () => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  connectionState = "CONNECTING";

  try {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      connectionState = "CONNECTED";
      reconnectAttempts = 0;
      clearInterval(pingInterval);
      pingInterval = setInterval(() => {
        sendWsEnvelope("PING", `keepalive-${Date.now()}`, null);
      }, PING_INTERVAL_MS);
    };

    socket.onmessage = processServerMessage;

    socket.onclose = () => {
      connectionState = "DISCONNECTED";
      clearInterval(pingInterval);
      scheduleReconnect();
    };

    socket.onerror = () => {
      connectionState = "DISCONNECTED";
      socket.close();
    };
  } catch {
    connectionState = "DISCONNECTED";
    scheduleReconnect();
  }
};

const scheduleReconnect = () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    connectionState = "IDLE";
    return;
  }

  const delayMs = Math.min(1000 * Math.pow(2, reconnectAttempts), 16000);
  reconnectAttempts += 1;
  connectionState = "RECONNECTING";

  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connectWebSocket, delayMs);
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_STATUS") {
    chrome.tabs.query({}).then((tabs) => {
      chrome.storage.local.get(["nakraku_last_stashed", "nakraku_last_stashed_at"]).then((data) => {
        sendResponse({
          state: connectionState,
          tabCount: tabs.length,
          reconnectAttempts,
          lastStashed: data.nakraku_last_stashed || [],
          lastStashedAt: data.nakraku_last_stashed_at || null,
        });
      });
    });
    return true;
  }

  if (message.type === "MANUAL_RECONNECT") {
    reconnectAttempts = 0;
    connectWebSocket();
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "MANUAL_STASH") {
    handleStashTabs(`manual-${Date.now()}`).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === "MANUAL_RESTORE") {
    chrome.storage.local.get(["nakraku_last_stashed"]).then(async (data) => {
      const tabs = data.nakraku_last_stashed || [];
      await handleRestoreTabs(`manual-restore-${Date.now()}`, { tabs });
      sendResponse({ ok: true, count: tabs.length });
    });
    return true;
  }

  return false;
});

connectWebSocket();
