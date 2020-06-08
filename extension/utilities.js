/**
 * Created by Anthony on 14/05/2016.
 */
/*eslint no-undef: "error"*/
/*eslint-env browser*/
/*global log,prefix_GMData*/

/*********************** Compatibilité Chrome ***************************/

function storageGetValue(key, defaultVal) {
    let retValue = localStorage.getItem(prefix_GMData + key);
    if (!retValue) {
        return defaultVal;
    }
    return retValue;
}

function storageSetValue(key, value) {
    localStorage.setItem(prefix_GMData + key, value);
}

function storageDeleteValue(value) {
    localStorage.removeItem(value);
}

/********************** Fin Compatibilité Chrome ************************/
/***************************** Utilities ********************************/
/* Fonctions sur strings */

String.prototype.trimInt = function () {
    let string = this.replace(/([^-\d])/g, '');
    return string ? parseInt(string) : 0;
};
String.prototype.trimZeros = function () {
    return this.replace(/^0+/g, '');
};
String.prototype.getInts = function (/*separator*/) {
    let v = this.match(/[0-9][0-9.]*/g);
    v.forEach(function (el, index, arr) {
        arr[index] = parseInt(el.replace(/\./g, ''));
    });
    return v;
};
//Affichage des Logs

function setlogLevel() {

    if (storageGetValue('debug.mode', 'false').toString() !== 'true') {
        log.setLevel('info');

    }else {
        log.setLevel('debug');
    }
}

//Requete Ajax

function Xajax(obj) {

    url_to = obj.url || '';
    post_data = obj.post || '';

    chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: url_to,
        data: post_data,
        dataType :  'text/plain; charset=UTF-8',
        crossDomain : true
    }, function(objResponse) {
         handleResponse( objResponse.status, objResponse.responseText );
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
        if (handler.fields.year !== -1)
            time.setYear(m[handler.fields.year]);
        if (handler.fields.month !== -1)
            time.setMonth(m[handler.fields.month] * 1 - 1);
        if (handler.fields.day !== -1)
            time.setDate(m[handler.fields.day]);
        if (handler.fields.hour !== -1)
            time.setHours(m[handler.fields.hour]);
        if (handler.fields.min !== -1)
            time.setMinutes(m[handler.fields.min]);
        if (handler.fields.sec !== -1)
            time.setSeconds(m[handler.fields.sec]);
    }
    time = Math.floor(time.getTime() / 1000);
    //division par 1000 pour un timestamp php
    return time;
}
/************************** Fin Utilities *******************************/

