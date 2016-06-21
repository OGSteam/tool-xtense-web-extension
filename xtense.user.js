// ==UserScript==
// @name	    Xtense-GM
// @version     2.7.1.0
// @author      OGSteam
// @namespace	xtense.ogsteam.fr
// @updateURL   https://bitbucket.org/darknoon29/tool-xtense-greasemonkey/downloads/xtense.meta.js
// @downloadURL https://bitbucket.org/darknoon29/tool-xtense-greasemonkey/downloads/xtense.user.js
// @include     https://*.ogame.*/game/index.php*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @description Cette extension permet d'envoyer des données du jeu à votre serveur OGSPY d'alliance
// ==/UserScript==
// Variables Xtense
var VERSION = '2.7.1.0';
var TYPE = 'GM-';
var PLUGIN_REQUIRED = '2.6.8';
var nomScript = 'Xtense';
var XtenseLocales = {};

//Variables globales pour les status - Type d'erreur
var XLOG_WARNING = 1,
    XLOG_ERROR = 2,
    XLOG_NORMAL = 3,
    XLOG_SUCCESS = 4,
    XLOG_COMMENT = 5,
    XLOG_SEND = 6;
// Navigateurs
var isFirefox = (window.navigator.userAgent.indexOf('Firefox') > -1) ? true : false;
var isChrome = (window.navigator.userAgent.indexOf('Chrome') > -1) ? true : false;
var isOpera = (window.navigator.userAgent.indexOf('Opera') > -1) ? true : false;
if (isFirefox) {
    TYPE += 'FF';
} else if (isChrome) {
    TYPE += 'GC';
} else if (isOpera) {
    TYPE += 'OP';
}
GM_setValue('last_message', 0);

/*************************** Init ***************************************/
// Variables globales données ogame

var url = location.href;
// Adresse en cours sur la barre d'outils
var urlUnivers = url.match(new RegExp('(.*)/game'))[1];
var numUnivers = urlUnivers.match(new RegExp('\/s(.*)-[a-z]{2}.ogame'))[1];
var langUnivers = urlUnivers.match(new RegExp('-(.*).ogame'))[1];
var prefix_GMData = langUnivers + numUnivers + '.';
log("Universe Number: " + numUnivers);
log("Universe language: " + langUnivers);
//Config JQuery
jQuery.support.cors = GM_getValue('cors.mode', 'true');

//Conversion Format adresse OGSPY
var res = GM_getValue('server.url.plugin', '').replace("/mod/xtense/xtense.php", "");
GM_setValue('server.url.plugin',res);

/******************************* Main ***********************************/

initOGSpyCommunication();
initParsers();
initLocales();
displayXtense();
setStatus(XLOG_NORMAL, Xl('Xtense_activated'));
handle_current_page();
//exit !!
/***************************** Fin Main *********************************/
