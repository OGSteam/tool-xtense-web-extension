//
//    Main Extension file
//

/*eslint-env browser*/
/*global log,initOGSpyCommunication,setlogLevel*/

// Variables Xtense
const VERSION = chrome.runtime.getManifest().version;
let TYPE = "GM-";
const PLUGIN_REQUIRED = "2.9.0";
const nomScript = "Xtense";
const XtenseLocales = {};

//Variables globales pour les status - Type d'erreur
const XLOG_WARNING = 1,
  XLOG_ERROR = 2,
  XLOG_NORMAL = 3,
  XLOG_SUCCESS = 4,
  XLOG_COMMENT = 5,
  XLOG_SEND = 6;

// Navigateurs
const userAgent = window.navigator.userAgent;
let isFirefox = userAgent.includes('Firefox');
let isChrome = userAgent.includes('Chrome');
let isOpera = userAgent.includes('Opera');

if (isFirefox) {
  TYPE += 'FF';
} else if (isChrome) {
  TYPE += 'GC';
} else if (isOpera) {
  TYPE += 'OP';
}

// Init
// Variables globales données ogame

const url = location.href;
// Adresse en cours sur la barre d'outils
const urlUnivers = url.match(new RegExp('(.*)/game'))[1];
const numUnivers = urlUnivers.match(new RegExp('\/s(.*)-[a-z]{2}.ogame'))[1];
const langUnivers = urlUnivers.match(new RegExp('-(.*).ogame'))[1];
const prefix_GMData = langUnivers + numUnivers + '.';


//Conversion Format adresse OGSPY
const res = storageGetValue('server.url.plugin', '').replace("/mod/xtense/xtense.php", "");
storageSetValue('server.url.plugin', res);

/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2025 OGSteam
 * @license     GNU GPL v2
 * @version     3.0.7
 */
setlogLevel(); // Default Info
log.info("Welcome to Xtense WE Version : " + VERSION);
log.info("Universe : " + numUnivers + "-" + langUnivers);
log.info("Xtense WE requires Mod Xtense " + PLUGIN_REQUIRED);

initOGSpyCommunication();
initParsers();
initLocales();
displayXtense();
setStatus(XLOG_NORMAL, xlang('Xtense_activated'));
handle_current_page();
//exit !!
/***************************** Fin Main *********************************/
