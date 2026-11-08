const statusBadge = document.getElementById("status-badge");
const statusText = document.getElementById("status-text");
const tabCount = document.getElementById("tab-count");
const retryCount = document.getElementById("retry-count");
const cacheMeta = document.getElementById("cache-meta");
const cacheList = document.getElementById("cache-list");
const btnStash = document.getElementById("btn-stash");
const btnSync = document.getElementById("btn-sync");
const btnRestore = document.getElementById("btn-restore");
const btnReconnect = document.getElementById("btn-reconnect");

const updateBadge = (state) => {
  statusBadge.className = "status-badge";
  const normalized = (state || "DISCONNECTED").toLowerCase();
  statusBadge.classList.add(`status-${normalized}`);
  statusText.textContent = state || "OFFLINE";
};

const renderCacheItems = (tabs) => {
  if (!tabs || tabs.length === 0) {
    cacheList.innerHTML = '<li class="cache-empty">No cached stashed tabs</li>';
    cacheMeta.textContent = "0 tabs";
    return;
  }

  cacheMeta.textContent = `${tabs.length} tabs`;
  cacheList.innerHTML = "";

  for (const tab of tabs.slice(0, 8)) {
    const li = document.createElement("li");
    li.className = "cache-item";

    const titleSpan = document.createElement("span");
    titleSpan.className = "cache-title-text";
    titleSpan.textContent = tab.title || tab.url || "Untitled";
    li.title = tab.url || "";

    li.appendChild(titleSpan);
    cacheList.appendChild(li);
  }
};

const refreshStatus = () => {
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      updateBadge("DISCONNECTED");
      tabCount.textContent = "--";
      retryCount.textContent = "0 / 5";
      return;
    }

    updateBadge(response.state);
    tabCount.textContent = String(response.tabCount ?? 0);
    retryCount.textContent = `${response.reconnectAttempts ?? 0} / 5`;
    renderCacheItems(response.lastStashed);
  });
};

btnStash?.addEventListener("click", () => {
  btnStash.disabled = true;
  btnStash.textContent = "Stashing...";
  chrome.runtime.sendMessage({ type: "MANUAL_STASH" }, () => {
    setTimeout(() => {
      btnStash.disabled = false;
      btnStash.textContent = "Stash Active Tabs";
      refreshStatus();
    }, 400);
  });
});

btnSync?.addEventListener("click", () => {
  btnSync.disabled = true;
  chrome.runtime.sendMessage({ type: "MANUAL_SYNC" }, () => {
    setTimeout(() => {
      btnSync.disabled = false;
      refreshStatus();
    }, 300);
  });
});

btnRestore?.addEventListener("click", () => {
  btnRestore.disabled = true;
  chrome.runtime.sendMessage({ type: "MANUAL_RESTORE" }, () => {
    setTimeout(() => {
      btnRestore.disabled = false;
      refreshStatus();
    }, 400);
  });
});

btnReconnect?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "MANUAL_RECONNECT" }, () => {
    setTimeout(refreshStatus, 300);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  refreshStatus();
  setInterval(refreshStatus, 2000);
});
