/**
 * Xtense - Mode Debug pour le parsing des messages
 *
 * @author      OGSteam
 * @copyright   2025 OGSteam
 * @license     GNU GPL v2
 * @version     3.1.2
 */
/* exported enableMessageDebug, disableMessageDebug, debugLog, analyzeMessageStructure, debugParseMessage, DEBUG_MESSAGES */

// Mode debug pour les messages
let DEBUG_MESSAGES = false;

/**
 * Active le mode debug des messages
 * Force le retraitement de tous les messages
 */
function enableMessageDebug() {
  DEBUG_MESSAGES = true;
  log.info("Mode debug des messages activé");
  // Forcer le retraitement des messages en réinitialisant les tailles
  storageSetValue("lastShtMsgsSize", 0);
  storageSetValue("lastMsgsSize", 0);
  storageSetValue("lastProcessedMessageIds", "[]");
}

/**
 * Désactive le mode debug des messages
 */
function disableMessageDebug() {
  DEBUG_MESSAGES = false;
  log.info("Mode debug des messages désactivé");
}

/**
 * Log un message de debug avec formatage spécial
 * @param {string} message - Le message à logger
 * @param {*} data - Données optionnelles à afficher
 */
function debugLog(message, data = null) {
  if (DEBUG_MESSAGES) {
    if (data) {
      console.group(`🐛 DEBUG: ${message}`);
      console.log(data);
      console.groupEnd();
    } else {
      console.log(`🐛 DEBUG: ${message}`);
    }
  }
}

/**
 * Analyse complète de la structure DOM d'un message
 * @param {HTMLElement} messageNode - Le nœud DOM du message
 * @param {number} index - L'index du message dans la liste
 */
function analyzeMessageStructure(messageNode, index) {
  if (!DEBUG_MESSAGES) return;

  console.group(`📧 Analyse du message ${index + 1}`);
  console.log("Node:", messageNode);
  console.log("Classes:", messageNode.className);
  console.log("ID:", messageNode.id);
  console.log("Attributs data-*:");

  // Analyser tous les attributs data-*
  for (let attr of messageNode.attributes) {
    if (attr.name.startsWith('data-')) {
      console.log(`  ${attr.name}: ${attr.value}`);
    }
  }

  console.log("Contenu textuel (100 premiers caractères):", messageNode.textContent.substring(0, 100) + "...");
  console.log("Structure interne:");
  console.log("  Éléments .rawMessageData:", messageNode.querySelectorAll('.rawMessageData').length);
  console.log("  Éléments .msg_content:", messageNode.querySelectorAll('.msg_content').length);
  console.log("  Éléments avec classes msgFilteredHeaderCell:", messageNode.querySelectorAll('[class*="msgFilteredHeaderCell"]').length);

  console.groupEnd();
}

/**
 * Debug du parsing d'un message spécifique
 * Teste tous les types de messages et affiche les résultats
 * @param {HTMLElement} messageNode - Le nœud DOM du message
 * @param {string} msgContent - Le contenu textuel du message
 * @param {string} idmsg - L'ID du message
 * @param {Object} locales - Les locales pour les regex
 */
function debugParseMessage(messageNode, msgContent, idmsg, locales) {
  if (!DEBUG_MESSAGES) return;

  console.group(`🔍 Debug parsing message ${idmsg}`);

  // Test de tous les types de messages
  const tests = [
    {
      name: "Espionnage ennemi",
      condition: msgContent.match(new RegExp(locales['espionnage action'])),
      handler: () => debugLog("Match espionnage ennemi détecté")
    },
    {
      name: "Recyclage",
      condition: msgContent.match(new RegExp(locales.fleet)) && msgContent.match(new RegExp(locales.harvesting)),
      handler: () => debugLog("Match recyclage détecté")
    },
    {
      name: "Expédition",
      condition: msgContent.match(new RegExp(locales.expeditionResult + XtenseRegexps.planetCoords)),
      handler: () => debugLog("Match expédition détecté")
    },
    {
      name: "Espionnage",
      condition: msgContent.match(new RegExp(locales['espionage of'] + XtenseRegexps.planetNameAndCoords)),
      handler: () => debugLog("Match espionnage détecté")
    },
    {
      name: "Combat",
      condition: msgContent.match(new RegExp(locales['combat of'])),
      handler: () => debugLog("Match combat détecté")
    }
  ];

  console.log("Contenu du message:", msgContent);
  console.log("Tests de correspondance:");

  let foundMatch = false;
  tests.forEach(test => {
    try {
      const result = test.condition;
      console.log(`  ${test.name}: ${result ? '✅' : '❌'}`);
      if (result) {
        foundMatch = true;
        test.handler();
      }
    } catch (error) {
      console.log(`  ${test.name}: ❌ (erreur: ${error.message})`);
    }
  });

  if (!foundMatch) {
    console.warn("⚠️ Aucun type de message reconnu");
  }

  // Analyser les locales disponibles
  console.log("Locales disponibles:", Object.keys(locales));

  // Vérifier la présence d'éléments spéciaux
  const rawDataElement = messageNode.querySelector('.rawMessageData');
  if (rawDataElement) {
    console.log("Élément rawMessageData trouvé avec attributs:");
    for (let attr of rawDataElement.attributes) {
      if (attr.name.startsWith('data-raw-')) {
        console.log(`  ${attr.name}: ${attr.value}`);
      }
    }
  } else {
    console.warn("Aucun élément .rawMessageData trouvé");
  }

  console.groupEnd();
}

/**
 * Analyse les résultats XPath et affiche des informations de debug
 * @param {Object} paths - Les XPath des messages
 * @param {XPathResult} messages - Résultat XPath pour les messages détaillés
 * @param {XPathResult} messagesCourt - Résultat XPath pour les messages courts
 */
function debugXPathResults(paths, messages, messagesCourt) {
  if (!DEBUG_MESSAGES) return;

  debugLog(`XPath showmessage: ${paths.showmessage}`);
  debugLog(`XPath shortmessages: ${paths.shortmessages}`);

  debugLog("Résultats XPath", {
    messagesDetailles: messages.snapshotLength,
    messagesCourts: messagesCourt.snapshotLength
  });
}

/**
 * Debug du début du traitement des messages courts
 * @param {number} nombre - Nombre de messages courts
 * @param {Object} locales - Les locales disponibles
 * @param {string} tabType - Le type d'onglet actuel
 */
function debugStartShortMessages(nombre, locales, tabType) {
  if (!DEBUG_MESSAGES) return;

  debugLog("Début du traitement des messages courts", {
    nombre: nombre,
    locales: Object.keys(locales),
    tabType: tabType
  });
}

/**
 * Debug de fin du traitement des messages courts
 */
function debugEndShortMessages() {
  if (!DEBUG_MESSAGES) return;

  debugLog("Fin du traitement des messages courts");
}

/**
 * Debug du traitement d'un type spécifique de message
 * @param {string} type - Le type de message traité
 * @param {string} idmsg - L'ID du message
 */
function debugMessageType(type, idmsg) {
  if (!DEBUG_MESSAGES) return;

  debugLog(`Traitement ${type} pour message ${idmsg}`);
}

/**
 * Debug pour un message non reconnu
 * @param {string} idmsg - L'ID du message
 */
function debugUnknownMessage(idmsg) {
  if (!DEBUG_MESSAGES) return;

  debugLog(`Aucun type de message reconnu pour ${idmsg}`);
}

/**
 * Vérifie si le mode debug est activé
 * @returns {boolean} - True si le mode debug est activé
 */
function isDebugMode() {
  return DEBUG_MESSAGES;
}

/**
 * Interface pour les commandes de debug depuis la console
 */
window.XtenseDebug = {
  enable: enableMessageDebug,
  disable: disableMessageDebug,
  isEnabled: isDebugMode,
  log: debugLog
};

// Log d'information au chargement
console.log("🔧 Xtense Debug Module chargé. Utilisez XtenseDebug.enable() pour activer le mode debug.");
