/**
 * @author OGSteam
 * @license GNU/GPL
 */

/*eslint-env es6*/
/*eslint no-undef: "error"*/
/*eslint-env browser*/
/*global log,storageSetValue,storageGetValue, XLOG_WARNING,XLOG_ERROR,XLOG_NORMAL,XLOG_SUCCESS,XLOG_COMMENT,XLOG_SEND*/

/* Permet d'initialiser la communication avec OGSPY (serveur, BDD)*/

function initOGSpyCommunication() {
    // Toutes les unites du jeu
    // id : nom du champ dans la bdd
    XtenseDatabase = {
        "resources": {
            601: "metal",
            602: "cristal",
            603: "deuterium",
            604: "energie"
        },
        "debris": {
            701: 'metal',
            702: 'cristal'
        },
        "buildings": {
            1: "M",
            2: "C",
            3: "D",
            4: "CES",
            12: "CEF",
            14: "UdR",
            15: "UdN",
            21: "CSp",
            212: "Sat",
            22: "HM",
            23: "HC",
            24: "HD",
            25: "CM",
            26: "CC",
            27: "CD",
            31: "Lab",
            33: "Ter",
            34: "DdR",
            44: "Silo",
            41: "BaLu",
            42: "Pha",
            43: "PoSa"
        },
        "researchs": {
            106: "Esp",
            108: "Ordi",
            109: "Armes",
            110: "Bouclier",
            111: "Protection",
            113: "NRJ",
            114: "Hyp",
            115: "RC",
            117: "RI",
            118: "PH",
            120: "Laser",
            121: "Ions",
            122: "Plasma",
            123: "RRI",
            124: "Astrophysique",
            199: "Graviton"
        },
        "fleet": {
            202: "PT",
            203: "GT",
            204: "CLE",
            205: "CLO",
            206: "CR",
            207: "VB",
            208: "VC",
            209: "REC",
            210: "SE",
            211: "BMD",
            212: "SAT",
            213: "DST",
            214: "EDLM",
            215: "TRA"
        },
        "defense": {
            401: "LM",
            402: "LLE",
            403: "LLO",
            404: "CG",
            405: "AI",
            406: "LP",
            407: "PB",
            408: "GB",
            502: "MIC",
            503: "MIP"
        }
    };
    //*************************************************
    //** Fonctions Xtense : Envoi de données à OGSpy **
    //*************************************************

    XtenseRequest = {
        loading: {},
        params: {},
        data: {},
        send: function () {

            let password_m;
            let postData = {};

            //Check if server has been properly configured before sending data
            if(storageGetValue("server.url.plugin", "" ) === "https://VOTRESITE/VOTREOGSPY"){
                log.info("Server 1 is not configured");
                let  message = xlang("unknown_server");
                setStatus(XLOG_WARNING,"[OGSpy] "+ message);
                return;
            }

            if (this.data.type === null)  {
                let message = xlang("error_internal");
                setStatus(XLOG_WARNING,"[OGSpy] "+ message);
                return;
            }
            postData.toolbar_version = VERSION;
            postData.toolbar_type = TYPE;
            postData.mod_min_version = PLUGIN_REQUIRED;
            postData.univers = urlUnivers;
            postData.type = this.data.type;

            storageSetValue("server.name", "OGSpy");
            postData.password = storageGetValue("server.pwd", "");
            postData.data = JSON.stringify(this.data.gamedata);
            log.info("Send Page Type " +  this.data.type);
            log.debug("sending Data" + JSON.stringify(this.data) + " to " + storageGetValue("server.url.plugin", "") + "/mod/xtense/xtense.php" + " from " + urlUnivers);
            new Xajax({
                url: storageGetValue("server.url.plugin", "") + "/mod/xtense/xtense.php",
                post: JSON.stringify(postData),
                callback: null,
                scope: this
            });
            if (storageGetValue("backup.link", "false").toString() === "true") {
                storageSetValue("server.name", "OGSpy Backup");
                postData.password = storageGetValue("server_backup.pwd", "");
                postData.data = JSON.stringify(this.data);
                log.debug("sending backup " + postData + " to " + storageGetValue("server_backup.url.plugin", "") + "/mod/xtense/xtense.php" + " from " + urlUnivers);
                new Xajax({
                    url: storageGetValue("server_backup.url.plugin", "") + "/mod/xtense/xtense.php",
                    post: JSON.stringify(postData),
                    callback: null,
                    scope: this
                });
            }
            /* Sauvegarde Pour Rapport utilisateur */
            storageSetValue('report.type',postData.type);
            storageSetValue('report.data',postData.data);
        },
        //Prépare la donnée avant envoi
        set: function (name, value) {
            if (typeof name === 'string') this.data[name] = value;
            else {
                this.data[name].push(JSON.stringify(value));
            }
        }

    };
}
/* Interpretation des retours Xtense (module OGSPY) */

function handleResponse(status, Response) {
    log.debug("ResponseStatus: " + status);
    log.debug("ResponseData: " + Response);
    let message_start = storageGetValue("server.name", "");

    if (status !== 200) {
        switch (status) {
            case 404 :
                message = xlang("http_status_404");
                break;
            case 403 :
                message =  xlang("http_status_403");
                break;
            case 500 :
                message =  xlang("http_status_500");
                break;
            default:
                message = xlang("http_status_unknown");
        }
        setStatus(XLOG_ERROR,"[" + message_start + "] "+ message);
    } else {
        var type = XLOG_SUCCESS;
        if (Response === '' || typeof (Response) === 'undefined') {
            setStatus(XLOG_ERROR, xlang("empty_response"));
            return;
        }
        if (Response === "hack") {
            setStatus(XLOG_ERROR, xlang("response_hack"));
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
                log.warn("full response:" + Response);
            } else {
                // Message d'erreur
                setStatus(XLOG_ERROR, xlang("invalid_response"));
                return;
            }
        }
        data = JSON.parse(data);
        let message = '';
        let code = data.type;
        if (data.status === 0) {
            type = XLOG_ERROR;
            switch (code) {
                case "wrong version":
                    if (data.target === "plugin") message = xlang("error_wrong_version_plugin");
                    else if (data.target === "xtense.php") message = xlang("error_wrong_version_xtense");
                    else message = xlang("error_wrong_version_toolbar");
                    break;
                case "php version" :
                    message = xlang("error_php_version");
                    break;
                case "server active":
                    message = xlang("error_server_active");
                    break;
                case "username" :
                    message = xlang("error_username");
                    break;
                case "password" :
                    message = xlang("error_password");
                    break;
                case "token" :
                    message = xlang("error_token");
                    break;
                case "user active" :
                    message = xlang("error_user_active");
                    break;
                case "home full" :
                    message = xlang("error_home_full");
                    break;
                case "plugin connections" :
                    message = xlang("error_plugin_connections");
                    break;
                case "plugin config" :
                    message = xlang("error_plugin_config");
                    break;
                case "plugin univers" :
                    message = xlang("error_plugin_univers");
                    break;
                case "plugin grant" :
                    message = xlang("error_grant_start");
                    break;
                default:
                    message = xlang("unknow_response");
            }
        } else {
            switch (code) {
                case "home updated" :
                    if(data.page === "overview") message = xlang("success_home_updated") + " (" + xlang("page_overview") + " "+ data.planet +")";
                    if(data.page === "labo") message = xlang("success_home_updated") + " (" + xlang("page_labo") + " "+ data.planet +")";
                    if(data.page === "buildings") message = xlang("success_home_updated") + " (" + xlang("page_buildings") + " "+ data.planet +")";
                    if(data.page === "fleet") message = xlang("success_home_updated") + " (" + xlang("page_fleet") + " "+ data.planet +")";
                    if(data.page === "defense") message = xlang("success_home_updated") + " (" + xlang("page_defense") + " "+ data.planet +")";
                    break;
                case "system" :
                    message = xlang("success_system") + " ("+data.galaxy+":"+data.system+")";
                    break;
                case "rc" :
                    message = xlang("success_rc");
                    break;
                case "rc_cdr":
                    message = xlang("success_rc_cdr");
                    break;
                case "messages":
                    message = xlang("success_messages");
                    break;
                case "ranking":
                    message = xlang("success_ranking") + " (" + data.offset.toString() +"-" + (parseInt(data.offset) + 99).toString() + ")";
                    break;
                case "ally_list":
                    message = xlang("success_ally_list");
                    break;
                case "spy":
                    message = xlang("success_spy");
                    break;
                default:
                    message = xlang("unknow_response");
            }
        }

        if (data.calls) {
            // Merge the both objects
            //var calls = extra.calls = data.calls;
            let calls = data.calls;
            calls.status = "success";
            if (calls.warning.length > 0) calls.status = "warning";
            if (calls.error.length > 0) calls.status = "error";
            // Calls messages
            if (data.call_messages) {
                calls.messages = {
                    success: [],
                    warning: [],
                    error: []
                };
                // Affichage des messages dans l'ordre : success, warning, error
                for (let i = 0, len = data.call_messages.length; i < len; i++) {
                    calls.messages[data.call_messages[i].type].push(data.call_messages[i].mod + ' : ' + data.call_messages[i].message);
                }
            }
        }
        setStatus(type, "[" + data.execution + " ms]" + "[" + message_start + "] "+ message);
    }
}

