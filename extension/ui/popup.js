/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2026 OGSteam
 * @license     GNU GPL v2
 * @version     3.4.2
 */
function getHostPattern(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new Error("URL du serveur OGSpy invalide");
  const raw = value.trim();
  if (!raw || raw === "https://VOTRESITE/VOTREOGSPY") return null;
  const normalized = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(normalized);
  } catch (error) {
    throw new Error("URL du serveur OGSpy invalide", {cause: error});
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.search || url.hash || url.hostname.includes("*") ||
      (raw.includes("://") && !/^https?:\/\//.test(raw))) {
    throw new Error("URL du serveur OGSpy invalide");
  }
  return `${url.protocol}//${url.hostname}/*`;
}

document.addEventListener("DOMContentLoaded", () => {
  const settingsPrefix = "xtense.settings.";
  const grantBtn = document.getElementById("btn_grant_permission");
  const statusEl = document.getElementById("permission_status");
  if (!grantBtn || !statusEl) return;

  let origins = [];
  let refreshId = 0;

  function showStatus(message, color, showButton) {
    statusEl.textContent = message;
    statusEl.style.color = color;
    grantBtn.style.display = showButton ? "inline-block" : "none";
  }

  function reportError(message) {
    console.error(message, chrome.runtime.lastError?.message);
    showStatus("Impossible de vérifier les permissions du serveur OGSpy.", "red", false);
  }

  function getConfiguredUrls(stored) {
    const profiles = new Map();
    for (const [key, value] of Object.entries(stored)) {
      if (!key.startsWith(settingsPrefix)) continue;
      const relativeKey = key.slice(settingsPrefix.length);
      const separator = relativeKey.indexOf(".", relativeKey.indexOf(".") + 1);
      if (separator === -1) continue;
      const profileId = relativeKey.slice(0, separator);
      const settingName = relativeKey.slice(separator + 1);
      if (!profiles.has(profileId)) profiles.set(profileId, {});
      profiles.get(profileId)[settingName] = value;
    }

    const urls = [];
    for (const profile of profiles.values()) {
      urls.push(profile["server.url.plugin"]);
      if (String(profile["backup.link"]) === "true") {
        urls.push(profile["server_backup.url.plugin"]);
      }
    }
    return urls;
  }

  function refreshStatus() {
    const currentRefresh = ++refreshId;
    origins = [];
    showStatus("Vérification de l'accès au serveur OGSpy…", "orange", false);
    chrome.storage.local.get(null, (stored) => {
      if (currentRefresh !== refreshId) return;
      if (chrome.runtime.lastError) {
        reportError("Impossible de lire la configuration OGSpy.");
        return;
      }

      try {
        origins = [...new Set(getConfiguredUrls(stored).map(getHostPattern).filter(Boolean))];
      } catch (error) {
        console.error(error.message);
        showStatus("URL du serveur OGSpy invalide : vérifiez la configuration.", "red", false);
        return;
      }
      if (origins.length === 0) {
        showStatus("Configurez d'abord un serveur OGSpy dans les options.", "orange", false);
        return;
      }
      chrome.permissions.contains({origins}, (granted) => {
        if (currentRefresh !== refreshId) return;
        if (chrome.runtime.lastError) {
          reportError("Impossible de vérifier les permissions OGSpy.");
        } else if (granted) {
          showStatus("✅ Accès serveur autorisé", "green", false);
        } else {
          showStatus("⚠ Accès au serveur OGSpy requis", "orange", true);
        }
      });
    });
  }

  grantBtn.addEventListener("click", () => {
    if (origins.length === 0) return;
    const currentRefresh = refreshId;
    chrome.permissions.request({origins}, (granted) => {
      if (currentRefresh !== refreshId) return;
      if (chrome.runtime.lastError) {
        reportError("Impossible de demander les permissions OGSpy.");
      } else if (granted) {
        refreshStatus();
      } else {
        showStatus("❌ Permission refusée", "red", true);
      }
    });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && Object.keys(changes).some(key => key.startsWith(settingsPrefix))) refreshStatus();
  });
  refreshStatus();
});
