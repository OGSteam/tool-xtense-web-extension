/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2026 OGSteam
 * @license     GNU GPL v2
 * @version     3.4.2
 */
const XTENSE_SETTINGS_PREFIX = "xtense.settings.";

function getProfileSetting(storageKey) {
  if (!storageKey.startsWith(XTENSE_SETTINGS_PREFIX)) return null;
  const relativeKey = storageKey.slice(XTENSE_SETTINGS_PREFIX.length);
  const separator = relativeKey.indexOf(".", relativeKey.indexOf(".") + 1);
  if (separator === -1) return null;
  return {
    profileId: relativeKey.slice(0, separator),
    settingName: relativeKey.slice(separator + 1)
  };
}

function getStoredProfiles(stored) {
  const profiles = new Map();
  for (const [key, value] of Object.entries(stored)) {
    const setting = getProfileSetting(key);
    if (!setting) continue;
    if (!profiles.has(setting.profileId)) profiles.set(setting.profileId, {});
    profiles.get(setting.profileId)[setting.settingName] = value;
  }
  return profiles.values();
}

function addServerOrigin(origins, value) {
  try {
    const parsed = new URL(value);
    if (["http:", "https:"].includes(parsed.protocol)) origins.add(parsed.origin);
  } catch {
    // Ignore invalid stored URLs; they must never become allowed origins.
  }
}

function getConfiguredServerOrigins(stored) {
  const origins = new Set();
  for (const profile of getStoredProfiles(stored)) {
    addServerOrigin(origins, profile["server.url.plugin"]);
    if (String(profile["backup.link"]) === "true") {
      addServerOrigin(origins, profile["server_backup.url.plugin"]);
    }
  }
  return origins;
}

function getHostPattern(url) {
  return `${url.protocol}//${url.hostname}/*`;
}

function hasHostPermission(url) {
  return new Promise(resolve => {
    chrome.permissions.contains({origins: [getHostPattern(url)]}, granted => {
      resolve(!chrome.runtime.lastError && granted);
    });
  });
}

function getStoredSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, stored => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(stored);
    });
  });
}

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

      const targetUrl = new URL(message.url);
      const targetOrigin = targetUrl.origin;
      try {
        const stored = await getStoredSettings();
        const allowedOrigins = getConfiguredServerOrigins(stored);
        if (!allowedOrigins.has(targetOrigin)) {
          console.warn(`[${message.messageId}] Blocked: origin not in allowlist: ${targetOrigin}`);
          replyToTab({ action: "xhttp_response", messageId: message.messageId, status: 403, error: "Origin not in allowlist" });
          return;
        }
        if (!targetUrl.pathname.endsWith("/mod/xtense/xtense.php")) {
          console.warn(`[${message.messageId}] Blocked: invalid OGSpy endpoint`);
          replyToTab({ action: "xhttp_response", messageId: message.messageId, status: 403, error: "Invalid OGSpy endpoint" });
          return;
        }
        if (!await hasHostPermission(targetUrl)) {
          console.warn(`[${message.messageId}] Blocked: host permission not granted: ${targetOrigin}`);
          replyToTab({ action: "xhttp_response", messageId: message.messageId, status: 403, error: "Host permission not granted" });
          return;
        }
      } catch (error) {
        console.error(`[${message.messageId}] Cannot read OGSpy settings:`, error.message);
        replyToTab({ action: "xhttp_response", messageId: message.messageId, status: 500, error: "Cannot read OGSpy settings" });
        return;
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
