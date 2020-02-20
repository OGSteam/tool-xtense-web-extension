/**
 * Created by Anthony on 14/05/2016.
 */

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

function log(message) {
    if (GM_getValue('debug.mode', 'false').toString() !== 'true') {
        return;
    }

    //d = new Date();
    var d = $.now();
    console.log('[' + d + '] '+ nomScript + ' : ' + message);
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

Element.prototype.serializeWithStyles = (function () {

    // Mapping between tag names and css default values lookup tables. This allows to exclude default values in the result.
    var defaultStylesByTagName = {};

    // Styles inherited from style sheets will not be rendered for elements with these tag names
    var noStyleTags = {"BASE":true,"HEAD":true,"HTML":true,"META":true,"NOFRAME":true,"NOSCRIPT":true,"PARAM":true,"SCRIPT":true,"STYLE":false,"TITLE":true};

    // This list determines which css default values lookup tables are precomputed at load time
    // Lookup tables for other tag names will be automatically built at runtime if needed
    var tagNames = ["A","ABBR","ADDRESS","AREA","ARTICLE","ASIDE","AUDIO","B","BASE","BDI","BDO","BLOCKQUOTE","BODY","BR","BUTTON","CANVAS","CAPTION","CENTER","CITE","CODE","COL","COLGROUP","COMMAND","DATALIST","DD","DEL","DETAILS","DFN","DIV","DL","DT","EM","EMBED","FIELDSET","FIGCAPTION","FIGURE","FONT","FOOTER","FORM","H1","H2","H3","H4","H5","H6","HEAD","HEADER","HGROUP","HR","HTML","I","IFRAME","IMG","INPUT","INS","KBD","KEYGEN","LABEL","LEGEND","LI","LINK","MAP","MARK","MATH","MENU","META","METER","NAV","NOBR","NOSCRIPT","OBJECT","OL","OPTION","OPTGROUP","OUTPUT","P","PARAM","PRE","PROGRESS","Q","RP","RT","RUBY","S","SAMP","SCRIPT","SECTION","SELECT","SMALL","SOURCE","SPAN","STRONG","STYLE","SUB","SUMMARY","SUP","SVG","TABLE","TBODY","TD","TEXTAREA","TFOOT","TH","THEAD","TIME","TITLE","TR","TRACK","U","UL","VAR","VIDEO","WBR"];

    // Precompute the lookup tables.
    for (var i = 0; i < tagNames.length; i++) {
        if(!noStyleTags[tagNames[i]]) {
            defaultStylesByTagName[tagNames[i]] = computeDefaultStyleByTagName(tagNames[i]);
        }
    }

    function computeDefaultStyleByTagName(tagName) {
        var defaultStyle = {};
        var element = document.body.appendChild(document.createElement(tagName));
        var computedStyle = getComputedStyle(element);
        for (var i = 0; i < computedStyle.length; i++) {
            defaultStyle[computedStyle[i]] = computedStyle[computedStyle[i]];
        }
        document.body.removeChild(element);
        return defaultStyle;
    }

    function getDefaultStyleByTagName(tagName) {
        tagName = tagName.toUpperCase();
        if (!defaultStylesByTagName[tagName]) {
            defaultStylesByTagName[tagName] = computeDefaultStyleByTagName(tagName);
        }
        return defaultStylesByTagName[tagName];
    }

    return function serializeWithStyles() {
        if (this.nodeType !== Node.ELEMENT_NODE) { throw new TypeError(); }
        var cssTexts = [];
        var elements = this.querySelectorAll("*");
        for ( var i = 0; i < elements.length; i++ ) {
            var e = elements[i];
            if (!noStyleTags[e.tagName]) {
                var computedStyle = getComputedStyle(e);
                var defaultStyle = getDefaultStyleByTagName(e.tagName);
                cssTexts[i] = e.style.cssText;
                for (var ii = 0; ii < computedStyle.length; ii++) {
                    var cssPropName = computedStyle[ii];
                    if (computedStyle[cssPropName] !== defaultStyle[cssPropName]) {
                        e.style[cssPropName] = computedStyle[cssPropName];
                    }
                }
            }
        }
        var result = this.outerHTML;
        for ( var index = 0; i < elements.length; i++ ) {
            elements[index].style.cssText = cssTexts[index];
        }
        return result;
    };
})();

/************************** Fin Utilities *******************************/
