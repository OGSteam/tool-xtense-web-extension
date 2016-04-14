/**
 * @author OGSteam
 * @license GNU/GPL
 */

/* Permet d'initialiser la communication avec OGSPY (serveur, BDD)*/

function initOGSpyCommunication() {
    // Toutes les unites du jeu
    // id : nom du champ dans la bdd
    XtenseDatabase = {
        'resources': {
            601: 'metal',
            602: 'cristal',
            603: 'deuterium',
            604: 'energie'
        },
        'buildings': {
            1: 'M',
            2: 'C',
            3: 'D',
            4: 'CES',
            12: 'CEF',
            14: 'UdR',
            15: 'UdN',
            21: 'CSp',
            212: 'Sat',
            22: 'HM',
            23: 'HC',
            24: 'HD',
            25: 'CM',
            26: 'CC',
            27: 'CD',
            31: 'Lab',
            33: 'Ter',
            34: 'DdR',
            44: 'Silo',
            41: 'BaLu',
            42: 'Pha',
            43: 'PoSa'
        },
        'researchs': {
            106: 'Esp',
            108: 'Ordi',
            109: 'Armes',
            110: 'Bouclier',
            111: 'Protection',
            113: 'NRJ',
            114: 'Hyp',
            115: 'RC',
            117: 'RI',
            118: 'PH',
            120: 'Laser',
            121: 'Ions',
            122: 'Plasma',
            123: 'RRI',
            124: 'Astrophysique',
            199: 'Graviton'
        },
        'fleet': {
            202: 'PT',
            203: 'GT',
            204: 'CLE',
            205: 'CLO',
            206: 'CR',
            207: 'VB',
            208: 'VC',
            209: 'REC',
            210: 'SE',
            211: 'BMD',
            212: 'SAT',
            213: 'DST',
            214: 'EDLM',
            215: 'TRA'
        },
        'defense': {
            401: 'LM',
            402: 'LLE',
            403: 'LLO',
            404: 'CG',
            405: 'AI',
            406: 'LP',
            407: 'PB',
            408: 'GB',
            502: 'MIC',
            503: 'MIP'
        }
    };
    //*************************************************
    //** Fonctions Xtense : Envoi de données à OGSpy **
    //*************************************************

    XtenseRequest = {
        postedData: [],
        loading: {},
        data: {},
        send: function () {
            var password_s = CryptoJS.SHA1(GM_getValue('server.pwd', ''));
            var password_m = CryptoJS.MD5(password_s.toString());
            var postData = 'toolbar_version=' + VERSION + '&toolbar_type=' + TYPE + '&mod_min_version=' + PLUGIN_REQUIRED + '&user=' + GM_getValue('server.user', '') + '&password=' + password_m + '&univers=' + urlUnivers + XtenseRequest.serializeData();
            log('sending ' + postData + ' to ' + GM_getValue('server.url.plugin', '') + ' from ' + urlUnivers);
            new Xajax({
                url: GM_getValue('server.url.plugin', ''),
                post: postData,
                callback: null,
                scope: this
            });
            var postedData = postData;
            var loading = true;
        },
        call: function (Server, Response) {
            XtenseRequest.loading[Server.n] = false;
            XtenseRequest.callback.apply(this.scope, [
                this,
                Server,
                Response
            ]);
        },
        set: function (name, value) {
            if (typeof name == 'string') this.data[name] = value;
            else {
                for (var n = 0, len = arguments.length; n < len; n++) {
                    for (var i in arguments[n]) this.data[i] = arguments[n][i];
                }
            }
        },
        serializeObject: function (obj, parent, tab) {
            var retour = '';
            var type = typeof obj;
            if (type == 'object') {
                for (var i in obj) {
                    if (parent != '')
                        var str = parent + '[' + i + ']';
                    else var str = i;
                    var a = false;
                    // Patch pour Graphic Tools for Ogame
                    if (str.search('existsTOG') == -1) {
                        a = this.serializeObject(obj[i], str, tab);
                    }
                    if (a != false)
                        tab.push(a);
                }
                return false;
            } else if (type == 'boolean')
                retour = (obj == true ? 1 : 0);
            else retour = obj + '';
            return parent + '=' + encodeURIComponent(retour).replace(new RegExp('(%0A)+', 'g'), '%20').replace(new RegExp('(%09)+', 'g'), '%20').replace(new RegExp('(%20)+', 'g'), '%20');
        },
        serializeData: function () {
            var uri = '';
            var tab = [];
            this.serializeObject(this.data, '', tab);
            uri = '&' + tab.join('&');
            return uri;
        },
    };
}
/* Interpretation des retours Xtense (module OGSPY) */

function handleResponse(status, Response) {
    //log("Response: " + Response);
    //log("Status: " + status);
    var message_start = '"' + GM_getValue('server.name', '') + '" : ';
    //var extra = {Request: Request, Server: Server, Response: Response, page: Request.data.type};
    if (status != 'success') {
        switch (status) {
            case 404 :
                setStatus(XLOG_ERROR, Xl('http_status_404'));
                break;
            case 403 :
                setStatus(XLOG_ERROR, Xl('http_status_403'));
                break;
            case 500 :
                setStatus(XLOG_ERROR, Xl('http_status_500'));
                break;
            default:
                setStatus(XLOG_ERROR, Xl('http_status_unknow'));
        }
    } else {
        var type = XLOG_SUCCESS;
        if (Response == '' || typeof (Response) == 'undefined') {
            setStatus(XLOG_ERROR, Xl('empty_response'));
            return;
        }
        if (Response == 'hack') {
            setStatus(XLOG_ERROR, Xl('response_hack'));
            return;
        }
        var data = {};
        if (Response.match(/^\{.*\}$/g)) {
            data = Response;
        } else {
            var match = null;
            if ((match = Response.match(/\(\{.*\}\)/))) {
                data = match[0];
                // Message d'avertissement
                type = XLOG_WARNING;
                log('full response:' + Response);
            } else {
                // Message d'erreur
                setStatus(XLOG_ERROR, Xl('invalid_response'));
                return;
            }
        }
        data = jQuery.parseJSON(data);
        var message = '';
        var code = data.type;
        if (data.status == 0) {
            type = XLOG_ERROR;
            switch (code) {
                case 'wrong version':
                    if (data.target == 'plugin') message = Xl('error_wrong_version_plugin');
                    else if (data.target == 'xtense.php') message = Xl('error_wrong_version_xtense');
                    else message = Xl('error_wrong_version_toolbar');
                    break;
                case 'php version' :
                    message = Xl('error_php_version');
                    break;
                case 'server active':
                    message = Xl('error_server_active');
                    break;
                case 'username' :
                    message = Xl('error_username');
                    break;
                case 'password' :
                    message = Xl('error_password');
                    break;
                case 'user active' :
                    message = Xl('error_user_active');
                    break;
                case 'home full' :
                    message = Xl('error_home_full');
                    break;
                case 'plugin connections' :
                    message = Xl('error_plugin_connections');
                    break;
                case 'plugin config' :
                    message = Xl('error_plugin_config');
                    break;
                case 'plugin univers' :
                    message = Xl('error_plugin_univers');
                    break;
                case 'plugin grant' :
                    message = Xl('error_grant_start');
                    break;
                default:
                    message = Xl('unknow_response');
            }
        } else {
            switch (code) {
                case 'home updated' :
                    if(data.page == 'overview') message = Xl('success_home_updated') + " (" + Xl('page_overview') + " "+ data.planet +")";
                    if(data.page == 'labo') message = Xl('success_home_updated') + " (" + Xl('page_labo') + " "+ data.planet +")";
                    if(data.page == 'buildings') message = Xl('success_home_updated') + " (" + Xl('page_buildings') + " "+ data.planet +")";
                    if(data.page == 'fleet') message = Xl('success_home_updated') + "( " + Xl('page_fleet') + " "+ data.planet +")";
                    if(data.page == 'defense') message = Xl('success_home_updated') + " (" + Xl('page_defense') + " "+ data.planet +")";
                    break;
                case 'system' :
                    message = Xl('success_system') + " ("+data.galaxy+":"+data.system+")";
                    break;
                case 'rc' :
                    message = Xl('success_rc');
                    break;
                case 'rc_cdr':
                    message = Xl('success_rc_cdr');
                    break;
                case 'messages':
                    message = Xl('success_messages');
                    break;
                case 'ranking':
                    message = Xl('success_ranking') + " (" + data.offset.toString() +"-" + (data.offset + 99).toString() + ")";
                    break;
                case 'ally_list':
                    message = Xl('success_ally_list');
                    break;
                case 'spy':
                    message = Xl('success_spy');
                    break;
                default:
                    message = Xl('unknow_response');
            }
        }

        if (data.calls) {
            // Merge the both objects
            //var calls = extra.calls = data.calls;
            var calls = data.calls;
            calls.status = 'success';
            if (calls.warning.length > 0) calls.status = 'warning';
            if (calls.error.length > 0) calls.status = 'error';
            // Calls messages
            if (data.call_messages) {
                calls.messages = {
                    success: [],
                    warning: [],
                    error: []
                };
                // Affichage des messages dans l'ordre : success, warning, error
                for (var i = 0, len = data.call_messages.length; i < len; i++) {
                    calls.messages[data.call_messages[i].type].push(data.call_messages[i].mod + ' : ' + data.call_messages[i].message);
                }
            }
        }
        setStatus(type, '[' + data.execution + ' ms] ' + message);
    }
}

