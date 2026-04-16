/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2025 OGSteam
 * @license     GNU GPL v2
 * @version     3.1.2
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toolbar_icon") {
    chrome.action.setIcon({
      path: message.newIconPath,
      tabId: sender.tab.id
    });
    chrome.action.setTitle({
      title: message.newTooltip,
      tabId: sender.tab.id
    });
    sendResponse({success: true});
    return false;
  }

  if (message.action === "xhttp") {
    console.log("Service Worker - Send HTTP Request", message.messageId || "unknown");

    try {
      new URL(message.url);
    } catch (error) {
      console.error(`[${message.messageId}] Invalid URL:`, message.url);
      chrome.tabs.sendMessage(sender.tab?.id, { action: "xhttp_response", messageId: message.messageId, status: 400, error: "Invalid URL" }, { frameId: sender.frameId ?? 0 }, () => {
        if (chrome.runtime.lastError) console.error(`[${message.messageId}] tabs.sendMessage failed:`, chrome.runtime.lastError.message);
      });
      return false;
    }

    const tabId = sender.tab?.id;
    const frameId = sender.frameId ?? 0;

    const replyToTab = (payload) => {
      if (tabId === undefined) {
        console.error(`[${message.messageId}] Cannot reply: sender.tab is undefined`);
        return;
      }
      chrome.tabs.sendMessage(tabId, payload, { frameId }, () => {
        if (chrome.runtime.lastError) {
          console.error(`[${message.messageId}] tabs.sendMessage failed:`, chrome.runtime.lastError.message);
        } else {
          console.log(`[${message.messageId}] tabs.sendMessage delivered OK`);
        }
      });
    };

    (async () => {
      console.log(`[${message.messageId}] Starting fetch to: ${message.url}`);

      // Origin allowlist: only allow ogame.gameforge.com and user-configured server origins
      const targetOrigin = new URL(message.url).origin;
      const ogamePattern = /^https:\/\/[a-z0-9-]+\.ogame\.gameforge\.com$/;
      if (!ogamePattern.test(targetOrigin)) {
        const stored = await new Promise(resolve =>
          chrome.storage.local.get(["serverUrl", "serverBackupUrl"], resolve)
        );
        const allowedOrigins = [];
        try { if (stored.serverUrl) allowedOrigins.push(new URL(stored.serverUrl).origin); } catch (_) {}
        try { if (stored.serverBackupUrl) allowedOrigins.push(new URL(stored.serverBackupUrl).origin); } catch (_) {}
        if (!allowedOrigins.includes(targetOrigin)) {
          console.warn(`[${message.messageId}] Blocked: origin not in allowlist: ${targetOrigin}`);
          replyToTab({ action: "xhttp_response", messageId: message.messageId, status: 403, error: "Origin not in allowlist" });
          return;
        }
      }

      // Permissions diagnostic — helps detect if the URL is blocked
      if (chrome.permissions?.getAll) {
        chrome.permissions.getAll(p => console.log(`[${message.messageId}] Granted origins:`, p.origins));
      }
      try {
        const fetchPromise = fetch(message.url, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: { 'Content-Type': message.dataType },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          body: message.data
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('fetch timeout after 10s')), 10000)
        );
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        console.log(`[${message.messageId}] Fetch completed, status: ${response.status}`);
        const text = await response.text();
        console.log(`[${message.messageId}] Response body:`, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        replyToTab({ action: "xhttp_response", messageId: message.messageId, status: response.status, text });
      } catch (error) {
        console.error(`[${message.messageId}] Fetch error:`, error.message);
        replyToTab({ action: "xhttp_response", messageId: message.messageId, status: 408, error: error.message });
      }
    })();

    return false; // response goes via tabs.sendMessage, no need to keep port open
  }
});
