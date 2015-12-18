// ==UserScript==
// @name	    Xtense-GM
// @version     2.6.1.3
// @author      OGSteam
// @namespace	xtense.ogsteam.fr
// @updateURL   https://bitbucket.org/darknoon29/tool-xtense-greasemonkey/downloads/xtense.meta.js
// @downloadURL https://bitbucket.org/darknoon29/tool-xtense-greasemonkey/downloads/xtense.user.js
// @include     http://*.ogame.*/game/index.php*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @description Cette extension permet d'envoyer des données du jeu à votre serveur OGSPY d'alliance
// ==/UserScript==
// Variables Xtense
var VERSION = '2.6.9.9';
var TYPE = 'GM-';
var PLUGIN_REQUIRED = '2.5.1';
var nomScript = 'Xtense';
var Xlang = {};
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
// Variables globales données ogame

var url = location.href;
// Adresse en cours sur la barre d'outils
var urlUnivers = url.match(new RegExp('(.*)/game'))[1];
var numUnivers = urlUnivers.match(new RegExp('s(.*)-fr.ogame'))[1];
var langUnivers = urlUnivers.match(new RegExp('-(.*).ogame'))[1];
var cookie = nomScript + '-' + numUnivers + '-';
var prefix_GMData = langUnivers + numUnivers + '.';
GM_setValue('last_message', 0);
/*********************** Compatibilité Chrome ***************************/

function GM_getValue(key, defaultVal) {
    var retValue = localStorage.getItem(prefix_GMData + key);
    if (!retValue) {
        return defaultVal;
    }
    return retValue;
}

function GM_setValue(key, value) {
    localStorage.setItem(prefix_GMData + key, value);
}

function GM_deleteValue(value) {
    localStorage.removeItem(value);
}

/********************** Fin Compatibilité Chrome ************************/
/***************************** Utilities ********************************/
/* Fonctions sur strings */

String.prototype.trim = function () {
    return this.replace(/^\s*/, '').replace(/\s*$/, '');
};
String.prototype.trimAll = function () {
    return this.replace(/\s*/g, '');
};
String.prototype.trimInt = function () {
    string = this.replace(/([^-\d])/g, '');
    return string ? parseInt(string) : 0;
};
String.prototype.trimZeros = function () {
    return this.replace(/^0+/g, '');
};
String.prototype.replaceAll = function (replace, with_this) {
    var re = new RegExp(replace, "g");
    return this.replace(re, with_this);
};

String.prototype.getInts = function (/*separator*/) {
    /*if(typeof separator!="undefined")reg=new Regexp("[0-9("+separator+")]+","g");
     else reg=new Regexp("[0-9("+separator+")]+","g");*/
    var v = this.match(/[0-9][0-9.]*/g);
    v.forEach(function (el, index, arr) {
        arr[index] = parseInt(el.replace(/\./g, ''));
    });
    return v;
};
//Affichage des Logs

function log(message) {
    if (GM_getValue('debug.mode', 'false').toString() == 'true') {
        console.log(nomScript + ' says : ' + message);
    }
}

//Requete Ajax

function Xajax(obj) {
        xhr = new XMLHttpRequest();
        url = obj.url || '';
        post = obj.post || '';
        xhr.open('POST', url, true);
        //xhr.setRequestHeader('User-Agent', 'Xtense2');
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(post);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                handleResponse(xhr);
            }
        };
}
function XajaxCompo(url) {
    var rcString = "";
    var xhr_object = new XMLHttpRequest();
    xhr_object.open("GET", url, true);
    xhr_object.send();

    xhr_object.onreadystatechange = function () {
        if (xhr_object.readyState == 4) {
            rcString = xhr_object.responseText;
            return(rcString);
        } else {
            return (false);
        }
    };
}

// Récupère les messages de retours et locales

function Xl(name) {
    try {
        if (!Xlang[name]) {
            log('Unknow locale "' + name + '"');
            return '[Chaine non disponible]';
        }
        var locale = Xlang[name];
        for (var i = 1, len = arguments.length; i < len; i++) {
            locale = locale.replace('$' + i, arguments[i]);
        }
        return locale;
    } catch (e) {
        alert(e);
        return false;
    }
}
// Permet de connaitre les locales du jeu suivant la langue (FR,ENG, ...)

function l(id) {
    return XtenseLocales[XtenseMetas.getLanguage()][id];
}
// Permet de récuper le time d'une date

function XtenseParseDate(dateString, handler) {
    var date = new Date();
    var m = dateString.match(new RegExp(handler.regexp));
    var time = new Date();
    if (m) {
        if (handler.fields.year != -1)
            time.setYear(m[handler.fields.year]);
        if (handler.fields.month != -1)
            time.setMonth(m[handler.fields.month] * 1 - 1);
        //Xconsole('month:'+m[handler.fields.month]+'|'+parseInt(m[handler.fields.month].trimZeros()));
        if (handler.fields.day != -1)
            time.setDate(m[handler.fields.day]);
        if (handler.fields.hour != -1)
            time.setHours(m[handler.fields.hour]);
        if (handler.fields.min != -1)
            time.setMinutes(m[handler.fields.min]);
        if (handler.fields.sec != -1)
            time.setSeconds(m[handler.fields.sec]);
    }
    time = Math.floor(time.getTime() / 1000);
    //division par 1000 pour un timestamp php
    return time;
}

//Fonction pour récupérer les nodes par nom de classe : http://www.developpez.net/forums/d620166/webmasters-developpement-web/javascript/dom-javascript-getelement-class/
function getElementByAttr(e, attr, value) {
    var tab = [];
    if (e.getAttribute && e.getAttribute(attr) == value)
        tab.push(e);
    var n = e.firstChild;
    if (n == null || typeof n == 'undefined') return tab;
    do {
        var tab2 = getElementByAttr(n, attr, value);
        tab = tab.concat(tab2);
    } while ((n = n.nextSibling) != null);
    return tab;
}
/************************** Fin Utilities *******************************/
/******************************* Main ***********************************/

initOGSpyCommunication();
initParsers();
initLocales();
displayXtense();
setStatus(XLOG_NORMAL, Xl('Xtense_activated'));
handle_current_page();
//exit !!
/***************************** Fin Main *********************************/
