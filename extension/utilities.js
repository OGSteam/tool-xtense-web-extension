/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2026 OGSteam
 * @license     GNU GPL v2
 * @version     3.4.1
 */
/*global log*/

/*********************** Stockage de l'extension ************************/

const XTENSE_SETTINGS_PREFIX = "xtense.settings.";
let xtenseSettingsKeyPrefix = "";
let xtenseSettingsCache = {};

/**
 * Loads the current universe settings from extension-owned storage, then
 * removes the obsolete settings for that universe from the OGame origin.
 *
 * @param {string} language Universe language
 * @param {string|number} universe Universe number
 * @returns {Promise<void>}
 */
function initializeSettingsStorage(language, universe) {
  xtenseSettingsKeyPrefix = `${XTENSE_SETTINGS_PREFIX}${language}.${universe}.`;
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, stored => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      xtenseSettingsCache = {};
      for (const [storageKey, value] of Object.entries(stored)) {
        if (storageKey.startsWith(xtenseSettingsKeyPrefix)) {
          xtenseSettingsCache[storageKey.slice(xtenseSettingsKeyPrefix.length)] = value;
        }
      }

      chrome.storage.local.remove(["serverUrl", "serverBackupUrl"], () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        const legacyPrefix = `${language}${universe}.`;
        const legacyKeys = [];
        for (let index = 0; index < localStorage.length; index++) {
          const legacyKey = localStorage.key(index);
          if (legacyKey?.startsWith(legacyPrefix)) legacyKeys.push(legacyKey);
        }
        for (const legacyKey of legacyKeys) localStorage.removeItem(legacyKey);
        resolve();
      });
    });
  });
}

function storageGetValue(key, defaultVal) {
  return Object.hasOwn(xtenseSettingsCache, key) ?
    xtenseSettingsCache[key] : defaultVal;
}

function storageSetValue(key, value, callback) {
  if (!xtenseSettingsKeyPrefix) {
    log.error("Le stockage Xtense n'est pas initialisé.");
    return false;
  }
  if (Object.hasOwn(xtenseSettingsCache, key) &&
      Object.is(xtenseSettingsCache[key], value)) {
    if (callback) callback(true);
    return true;
  }

  const hadPreviousValue = Object.hasOwn(xtenseSettingsCache, key);
  const previousValue = xtenseSettingsCache[key];
  xtenseSettingsCache[key] = value;
  chrome.storage.local.set({[xtenseSettingsKeyPrefix + key]: value}, () => {
    if (chrome.runtime.lastError) {
      if (Object.is(xtenseSettingsCache[key], value)) {
        if (hadPreviousValue) xtenseSettingsCache[key] = previousValue;
        else delete xtenseSettingsCache[key];
      }
      log.error("Impossible d'enregistrer le paramètre Xtense : " + chrome.runtime.lastError.message);
      if (callback) callback(false);
    } else if (callback) {
      callback(true);
    }
  });
  return true;
}

function storageDeleteValue(key) {
  if (!xtenseSettingsKeyPrefix) return false;
  const hadPreviousValue = Object.hasOwn(xtenseSettingsCache, key);
  const previousValue = xtenseSettingsCache[key];
  delete xtenseSettingsCache[key];
  chrome.storage.local.remove(xtenseSettingsKeyPrefix + key, () => {
    if (chrome.runtime.lastError) {
      if (hadPreviousValue && !Object.hasOwn(xtenseSettingsCache, key)) {
        xtenseSettingsCache[key] = previousValue;
      }
      log.error("Impossible de supprimer le paramètre Xtense : " + chrome.runtime.lastError.message);
    }
  });
  return true;
}

/********************* Fin stockage de l'extension **********************/
/***************************** Utilities ********************************/
/* Fonctions sur strings */

String.prototype.trimInt = function () {
  let string = this.replace(/([^-\d])/g, "");
  return string ? parseInt(string) : 0;
};
String.prototype.trimZeros = function () {
  return this.replace(/^0+/g, "");
};
String.prototype.getInts = function (/*separator*/) {
  let v = this.match(/\d[0-9.]*/g);
  v.forEach(function (el, index, arr) {
    arr[index] = parseInt(el.replace(/\./g, ""));
  });
  return v;
};

//Affichage des Logs

function setlogLevel() {
  if (storageGetValue("debug.mode", "false").toString() !== "true") {
    log.setLevel("info");
  } else {
    log.setLevel("debug");
  }
}

//Requete Ajax

const _xajaxPending = {};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "xhttp_response" && _xajaxPending[msg.messageId]) {
    _xajaxPending[msg.messageId](msg);
    delete _xajaxPending[msg.messageId];
  }
  return false;
});

function Xajax(obj) {
  let url_to = obj.url || "";
  let post_data = obj.post || "";

  return new Promise((resolve) => {
    const messageId = Date.now();
    log.debug(`[${messageId}] Sending request to: ${url_to}`);

    _xajaxPending[messageId] = (response) => {
      log.debug(`[${messageId}] Response received:`, response);

      if (!response) {
        log.error(`[${messageId}] No response received from background worker`);
        handleResponse(500, "No response from background service");
        resolve(null);
        return;
      }

      if (response.error) {
        log.error(`[${messageId}] Request error:`, response.error);
        handleResponse(500, response.error);
      } else if (response.status === 200) {
        log.debug(`[${messageId}] Request successful`);
        handleResponse(200, response.text);
      } else {
        log.error(`[${messageId}] Unknown response format:`, response);
        handleResponse(500, "Unknown response format");
      }
      resolve(response);
    };

    chrome.runtime.sendMessage({
      method: "POST",
      action: "xhttp",
      url: url_to,
      data: post_data,
      dataType: "text/plain; charset=UTF-8",
      crossDomain: true,
      messageId: messageId
    });
  });
}

// Récupère les messages de retours et locales

/**
 * Gets Strings from the language file extension Folder (_locales)
 * @return {string}
 */
function xlang(name) {
  return chrome.i18n.getMessage("XtenseMsg_" + name);
}

/**
 * Gets Strings from the xtense file definition (OgameLocales.js)
 * @return {string}
 */
function glang(id) {
  return XtenseLocales[XtenseMetas.getLanguage()][id];
}

// Permet de récuper le time d'une date

function XtenseParseDate(dateString, handler) {
  let m = dateString.match(new RegExp(handler.regexp));
  let time = new Date();
  if (m) {
    if (handler.fields.year !== -1) time.setYear(m[handler.fields.year]);
    if (handler.fields.month !== -1)
      time.setMonth(m[handler.fields.month] * 1 - 1);
    if (handler.fields.day !== -1) time.setDate(m[handler.fields.day]);
    if (handler.fields.hour !== -1) time.setHours(m[handler.fields.hour]);
    if (handler.fields.min !== -1) time.setMinutes(m[handler.fields.min]);
    if (handler.fields.sec !== -1) time.setSeconds(m[handler.fields.sec]);
  }
  time = Math.floor(time.getTime() / 1000);
  //division par 1000 pour un timestamp php
  return time;
}

/**
 * Validates and normalizes an OGSpy server URL.
 * Normalizes the URL (adds https://, strips trailing slashes),
 * then checks protocol, embedded credentials, and disallowed fragments/queries.
 *
 * @param {string} url - Raw URL from user input
 * @returns {{valid: boolean, normalized: string, error: string}}
 */
function validateServerUrl(url) {
  const PLACEHOLDER = "https://VOTRESITE/VOTREOGSPY";
  if (!url || url.trim() === "" || url.trim() === PLACEHOLDER) {
    return { valid: false, normalized: "", error: "server_url_empty" };
  }
  let normalized = url.trim().replace(/\/+$/, "");
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch (e) {
    return { valid: false, normalized: "", error: "server_url_invalid" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, normalized: "", error: "server_url_protocol" };
  }
  if (parsed.username || parsed.password) {
    return { valid: false, normalized: "", error: "server_url_credentials" };
  }
  if (parsed.search || parsed.hash) {
    return { valid: false, normalized: "", error: "server_url_format" };
  }
  return { valid: true, normalized: normalized, error: "" };
}

/************************** Fin Utilities *******************************/

