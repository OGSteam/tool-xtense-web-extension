/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2025 OGSteam
 * @license     GNU GPL v2
 * @version     3.1.2
 */
/*eslint-env browser*/
/*global log,storageSetValue,storageGetValue, XLOG_WARNING,XLOG_ERROR,XLOG_SUCCESS, XtenseDatabase, xlang, Xajax, setStatus, VERSION, TYPE, PLUGIN_REQUIRED, urlUnivers */

/* Permet d'initialiser la communication avec OGSPY (serveur, BDD)*/

function initOGSpyCommunication() {
  // Toutes les unites du jeu
  // id : nom du champ dans la bdd
  XtenseDatabase = {
    "resources": {601: "metal", 602: "cristal", 603: "deuterium", 604: "energie"},
    "debris": {701: 'metal', 702: 'cristal',703: 'deuterium'},
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
    /**
     * Sends data to OGSpy server
     * @returns {Promise<void>}
     */
    send: async function () {
      try {
        //Check if server has been properly configured before sending data
        const serverUrl = storageGetValue("server.url.plugin", "");
        if (serverUrl === "https://VOTRESITE/VOTREOGSPY") {
          log.info("Server 1 is not configured");
          const message = xlang("unknown_server");
          setStatus(XLOG_WARNING, "[OGSpy] " + message);
          return;
        }

        if (!this.data.type) {
          const message = xlang("error_internal");
          setStatus(XLOG_WARNING, "[OGSpy] " + message);
          return;
        }

        const postData = {
          toolbar_version: VERSION,
          toolbar_type: TYPE,
          mod_min_version: PLUGIN_REQUIRED,
          univers: urlUnivers,
          type: this.data.type,
          password: storageGetValue("server.pwd", ""),
          data: JSON.stringify(this.data.gamedata)
        };

        storageSetValue("server.name", "OGSpy");

        log.info(`Send Page Type ${this.data.type}`);
        log.debug(`Sending Data ${JSON.stringify(this.data)} to ${serverUrl}/mod/xtense/xtense.php from ${urlUnivers}`);

        // Primary server request
        new Xajax({
          url: `${serverUrl}/mod/xtense/xtense.php`,
          post: JSON.stringify(postData),
          callback: null,
          scope: this
        });

        // Handle backup server if enabled
        if (storageGetValue("backup.link", "false").toString() === "true") {
          try {
            const backupUrl = storageGetValue("server_backup.url.plugin", "");
            if (!backupUrl) {
              log.warn("Backup server URL not configured");
              return;
            }

            storageSetValue("server.name", "OGSpy Backup");
            const backupPostData = {
              ...postData,
              password: storageGetValue("server_backup.pwd", ""),
              data: JSON.stringify(this.data)
            };

            log.debug(`Sending backup to ${backupUrl}/mod/xtense/xtense.php from ${urlUnivers}`);
            new Xajax({
              url: `${backupUrl}/mod/xtense/xtense.php`,
              post: JSON.stringify(backupPostData),
              callback: null,
              scope: this
            });
          } catch (backupError) {
            log.error(`Error sending to backup server: ${backupError.message}`);
          }
        }

        /* Sauvegarde Pour Rapport utilisateur */
        storageSetValue('report.type', postData.type);
        storageSetValue('report.data', postData.data);
      } catch (error) {
        log.error(`Error in XtenseRequest.send: ${error.message}`);
        setStatus(XLOG_ERROR, `[OGSpy] Error: ${error.message}`);
      }
    },

    /**
     * Prépare la donnée avant envoi
     * @param {string|object} name - Name of the data or data object
     * @param {*} value - Value to set
     */
    set: function (name, value) {
      if (typeof name === 'string') {
        this.data[name] = value;
      } else if (typeof name === 'object' && name !== null) {
        // Si name est un objet, on merge ses propriétés dans this.data
        Object.assign(this.data, name);
      } else {
        log.warn(`Invalid data type for ${name} in XtenseRequest.set - expected string or object`);
      }
    }
  };
}

/**
 * Interpretation des retours Xtense (module OGSPY)
 * @param {number} status - HTTP status code
 * @param {string} Response - Server response
 */
function handleResponse(status, Response) {
  try {
    const message_start = storageGetValue("server.name", "");

    // Handle HTTP errors
    if (status !== 200) {
      let message;
      switch (status) {
        case 404:
          message = xlang("http_status_404");
          break;
        case 403:
          message = xlang("http_status_403");
          break;
        case 500:
          message = xlang("http_status_500");
          break;
        default:
          message = xlang("http_status_unknown");
      }
      setStatus(XLOG_ERROR, `[${message_start}] ${message}`);
      return;
    }

    // Handle empty responses
    if (Response === '' || typeof (Response) === 'undefined') {
      setStatus(XLOG_ERROR, xlang("empty_response"));
      return;
    }

    // Handle hack response
    if (Response === "hack") {
      setStatus(XLOG_ERROR, xlang("response_hack"));
      return;
    }

    // Parse JSON response
    let data = {};
    if (Response.match(/^\{.*\}$/g)) {
      try {
        data = JSON.parse(Response);
        let message = '';
        let code = data.type;
        let type = XLOG_SUCCESS;
        let pageType;
        let planet;
        let offset;
        let endOffset;

        if (data.status === 0) {
          type = XLOG_ERROR;
          switch (code) {
            case "wrong version":
              if (data.target === "plugin") message = xlang("error_wrong_version_plugin");
              else if (data.target === "xtense.php") message = xlang("error_wrong_version_xtense");
              else message = xlang("error_wrong_version_toolbar");
              break;
            case "php version":
              message = xlang("error_php_version");
              break;
            case "server active":
              message = xlang("error_server_active");
              break;
            case "username":
              message = xlang("error_username");
              break;
            case "password":
              message = xlang("error_password");
              break;
            case "token":
              message = xlang("error_token");
              break;
            case "user active":
              message = xlang("error_user_active");
              break;
            case "home full":
              message = xlang("error_home_full");
              break;
            case "plugin connections":
              message = xlang("error_plugin_connections");
              break;
            case "plugin config":
              message = xlang("error_plugin_config");
              break;
            case "plugin univers":
              message = xlang("error_plugin_univers");
              break;
            case "plugin grant":
              message = xlang("error_grant_start");
              break;
            default:
              message = xlang("unknow_response");
          }
        } else {
          switch (code) {
            case "home updated":
              pageType = data.page || "unknown";
              planet = data.planet || "unknown";
              message = `${xlang("success_home_updated")} (${xlang(`page_${pageType}`)} ${planet})`;
              break;
            case "system":
              message = `${xlang("success_system")} (${data.galaxy}:${data.system})`;
              break;
            case "rc":
              message = xlang("success_rc");
              break;
            case "rc_cdr":
              message = xlang("success_rc_cdr");
              break;
            case "messages":
              message = xlang("success_messages");
              break;
            case "ranking":
              offset = parseInt(data.offset);
              endOffset = offset + 99;
              message = `${xlang("success_ranking")} (${offset}-${endOffset})`;
              break;
            case "ally_list":
              message = xlang("success_ally_list");
              break;
            case "spy":
              message = xlang("success_spy");
              break;
            default:
              message = xlang("success_unknown");
          }
        }

        setStatus(type, `[${message_start}] ${message}`);

      } catch (jsonError) {
        log.error(`JSON parse error: ${jsonError.message}`);
        setStatus(XLOG_ERROR, `[${message_start}] ${xlang("error_json_parse")}`);
      }
    } else {
      log.warn(`Unexpected response format: ${Response.substring(0, 100)}`);
      setStatus(XLOG_WARNING, `[${message_start}] ${xlang("error_response_format")}`);
    }
  } catch (error) {
    log.error(`Error in handleResponse: ${error.message}`);
    setStatus(XLOG_ERROR, `Error processing response: ${error.message}`);
  }
}
