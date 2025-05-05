/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2025 OGSteam
 * @license     GNU GPL v2
 * @version     3.0.0
 */
/*eslint-env browser*/

/*global log,prefix_GMData*/

/*********************** Compatibilité Chrome ***************************/

function storageGetValue(key, defaultVal) {
  try {
    // Vérifier si la clé existe réellement dans localStorage
    if (!localStorage.hasOwnProperty(prefix_GMData + key)) {
      return defaultVal;
    }

    // Récupérer la valeur stockée
    let retValue = localStorage.getItem(prefix_GMData + key);

    // Tenter de détecter et convertir le type de données
    if (retValue === 'true') return true;
    if (retValue === 'false') return false;
    if (retValue === 'null') return null;
    if (retValue === 'undefined') return undefined;

    // Essayer de parser en JSON si c'est un objet ou un tableau
    if (retValue && (retValue.startsWith('{') || retValue.startsWith('['))) {
      try {
        return JSON.parse(retValue);
      } catch (e) {
        // Si échec de parsing, retourner la chaîne brute
      }
    }

    // Essayer de convertir en nombre si c'est numérique
    if (!isNaN(retValue) && retValue.trim() !== '') {
      // Convertir en nombre seulement si c'est réellement un nombre
      const num = Number(retValue);
      if (Number.isFinite(num)) return num;
    }

    // Sinon, retourner la chaîne telle quelle
    return retValue;
  } catch (e) {
    log.error('Erreur lors de la récupération de la valeur:', e.message);
    return defaultVal;
  }
}


function storageSetValue(key, value) {
  try {
    // Conversion explicite selon le type de données
    let valueToStore = typeof value === 'object' ?
      JSON.stringify(value) : String(value);

    localStorage.setItem(prefix_GMData + key, valueToStore);
    return true;
  } catch (e) {
    log.error('Erreur lors du stockage de la valeur:', e.message);
    return false;
  }
}


function storageDeleteValue(value) {
  localStorage.removeItem(value);
}

/********************** Fin Compatibilité Chrome ************************/
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

function Xajax(obj) {
  let url_to = obj.url || "";
  let post_data = obj.post || "";

  return new Promise((resolve) => {
    const messageId = Date.now();
    console.log(`[${messageId}] Sending request to: ${url_to}`);

    chrome.runtime.sendMessage(
      {
        method: "POST",
        action: "xhttp",
        url: url_to,
        data: post_data,
        dataType: "text/plain; charset=UTF-8",
        crossDomain: true,
        messageId: messageId
      },
      function (response) {
        console.log(`[${messageId}] Response received:`, response);

        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message;
          console.error(`[${messageId}] Runtime error:`, errorMsg);
          handleResponse(500, errorMsg);
          resolve(null);
          return;
        }

        if (!response) {
          console.error(`[${messageId}] No response received from background worker`);
          handleResponse(500, "No response from background service");
          resolve(null);
          return;
        }

        if (response.error) {
          console.error(`[${messageId}] Request error:`, response.error);
          handleResponse(500, response.error);
        } else if (response.status === 200) {
          console.log(`[${messageId}] Request successful`);
          handleResponse(200, response.text);
        } else {
          console.error(`[${messageId}] Unknown response format:`, response);
          handleResponse(500, "Unknown response format");
        }
        resolve(response);
      }
    );
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

/************************** Fin Utilities *******************************/
