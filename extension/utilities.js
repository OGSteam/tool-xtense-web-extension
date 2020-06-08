/**
 * Created by Anthony on 14/05/2016.
 */
/*eslint no-undef: "error"*/
/*eslint-env browser*/
/*global log*/

/*********************** Compatibilité Chrome ***************************/

function GM_getValue(key, defaultVal) {
    let retValue = localStorage.getItem(prefix_GMData + key);
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

function setlogLevel() {

    if (GM_getValue('debug.mode', 'false').toString() !== 'true') {
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
 * @return {string}
 */
function Xl(name) {
    return chrome.i18n.getMessage("XtenseMsg_" + name);
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
