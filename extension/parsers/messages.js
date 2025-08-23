/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2025 OGSteam
 * @license     GNU GPL v2
 * @version     3.1.2
 */
/* exported parse_messages, get_tabid, parse_rc */

function get_tabid() {
  console.log("get_tabid called");
  let current_tab = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.messages.tab);
  let tab_id = current_tab.snapshotItem(0).value;
  let type;

  switch (tab_id) {
    case '11':
      type = 'spy_shared';
      break;
    case '12':
      type = 'rc_shared';
      break;
    case '13':
      type = 'expedition_shared';
      break;
    case '20':
      type = 'spy';
      break;
    case '21':
      type = 'rc';
      break;
    case '22':
      type = 'expedition';
      break;
    // Dans les autres cas, on ne détermine pas le type par rapport à l'onglet
    default:
      type = 'undefined';
      break;
  }

  log.info("Tab ID: " + tab_id + " - Type: " + type);
  return type;
}


/* Page Messages */

function parse_messages() {
  let paths = XtenseXpaths.messages;
  let messages = Xpath.getOrderedSnapshotNodes(document, paths.showmessage, null);
  let messagesCourt = Xpath.getOrderedSnapshotNodes(document, paths.shortmessages, null);

  log.debug('Nombre Messages courts: ' + messagesCourt.snapshotLength);
  log.debug('Nombre Messages classiques: ' + messages.snapshotLength);

  // Vérifier s'il y a des messages à traiter
  if (messagesCourt.snapshotLength === 0 && messages.snapshotLength === 0) {
    log.debug('parse_messages - Aucun message détecté, arrêt du traitement');
    setStatus(XLOG_NORMAL, xlang('no_messages'));
    return;
  }

  setStatus(XLOG_NORMAL, xlang('messages_detected'));

  // Traitement des listes de messages court (déclenche lorsque le nombre de messages détecté change)
  if (messagesCourt.snapshotLength > 0) {
    parse_short_messages(messagesCourt, messages);
  }

  // Traitement d'un message detaille (declenche lorsque l'on affiche le detail d'un message ou lorsque l'on change de page de msg detaille)
  if (messages.snapshotLength > 0) {
    log.info("Traitement d'un message detaille");
    parse_detail_messages(messages);
  }
}

function parse_short_messages(messagesCourt, messages) {
  let paths = XtenseXpaths.messages;
  let lastShtMsgsSize = storageGetValue("lastShtMsgsSize", 0);
  let lastMsgsSize = storageGetValue("lastMsgsSize", 0);

  // Pas de messages à traiter
  if (messagesCourt.snapshotLength === 0) {
    log.debug('parse_short_messages - Pas de messages à traiter');
    return;
  }
  // Si le nombre de messages présent est le même que lors du dernier traitement
  // On considère qu'il n'y a pas de nouveaux messages
  if (messagesCourt.snapshotLength === lastShtMsgsSize && messages.snapshotLength === lastMsgsSize) {
    log.debug('parse_short_messages - Pas de nouveaux messages');
    return;
  }

  let locales = glang('messages');
  let tab_type = get_tabid();
  log.info("Traitement des messages court");

  // Parcours de la liste de messages court
  // TODO : Ne pas re-parcourir les messages court deja parse
  for (let cptShtMsg = 0; cptShtMsg < messagesCourt.snapshotLength; cptShtMsg++) {
    let shortMessageNode = messagesCourt.snapshotItem(cptShtMsg);
    let msgContent = shortMessageNode.textContent.trim();

    // Recupere l'id du message court
    let idmsg = shortMessageNode.attributes['data-msg-id'].value;
    log.debug("ID Message court : " + idmsg);

    // Vérifier si ce message a déjà été traité - correction du bug de type
    let lastProcessedIdsString = storageGetValue("lastProcessedMessageIds", "[]");
    let lastProcessedIds;

    try {
      // S'assurer que c'est bien un tableau
      if (typeof lastProcessedIdsString === 'string') {
        lastProcessedIds = JSON.parse(lastProcessedIdsString);
      } else {
        lastProcessedIds = lastProcessedIdsString;
      }

      // Vérifier que c'est bien un tableau
      if (!Array.isArray(lastProcessedIds)) {
        lastProcessedIds = [];
      }
    } catch (error) {
      log.debug("Erreur lors du parsing des IDs traités, réinitialisation:", error);
      lastProcessedIds = [];
    }

    if (lastProcessedIds.includes(idmsg)) {
      log.debug("Message " + idmsg + " déjà traité, passage au suivant");
      continue;
    }

    // Espionnage ennemi
    if ((storageGetValue("handle.msg.ennemy.spy").toString() === 'true') && msgContent.match(new RegExp(locales['espionnage action']))) {

      log.info("Message court Espionnage Ennemi détecté");
      let ToInfo = msgContent.match(new RegExp(XtenseRegexps.messages.ennemy_spy_to));
      let proba = msgContent.match(new RegExp(XtenseRegexps.messages.ennemy_spy_proba));

      if (ToInfo) {
        let data = {};

        data.type = 'ennemy_spy';
        data.to = ToInfo[1];
        data.proba = proba[1];
        let msgInnerHTML = shortMessageNode.innerHTML.trim();
        //log.info(msgInnerHTML);

        //Données de la planètre ciblées
        data.toMoon = 0;
        let moonTo = msgInnerHTML.match(new RegExp(XtenseRegexps.messages.ennemy_spy_moon));
        if (moonTo) { //Cas où la lune est absente
          if (moonTo[1] === 'moon') {
            data.toMoon = 1;
          }
        }
        //Données de la planètre origine
        let fromdetails = msgInnerHTML.match(new RegExp(XtenseRegexps.messages.ennemy_spy_from));
        if (fromdetails) {
          data.from = fromdetails[1] + ':' + fromdetails[2] + ':' + fromdetails[3];
          data.fromMoon = 0;
          if (fromdetails[4] === 3) { //3 is mission type for luna
            data.fromMoon = 1;
          }
        }
        //data.proba = fromToInfo[3];
        data.date = XtenseParseDate(msgContent, glang('dates').messages);
        XtenseRequest.set('gamedata', data);
        XtenseRequest.set('type', 'messages');
        XtenseRequest.send();
        log.info("Short Message Ennemy spy report sent from " + data.from + " to " + data.to);
        //}
      }
    }

    // Recyclage
    else if ((storageGetValue("handle.msg.rc.cdr").toString() === 'true') && msgContent.match(new RegExp(locales.fleet)) && msgContent.match(new RegExp(locales.harvesting))) { //OK
      log.info("Message court Recyclage détecté");
      let m = msgContent.match(new RegExp(XtenseRegexps.coords));
      if (m) {
        let data = {};
        let coords = m[1];
        let nums = msgContent.getInts();

        data.type = 'rc_cdr';
        data.coords = coords;
        data.date = XtenseParseDate(msgContent, glang('dates').messages);

        if (msgContent.match(new RegExp(locales.antimatiere))) {
          data.AM_total = nums[10];
          data.AM_recovered = nums[11];
        } else {
          data.nombre = nums[7];
          data.M_recovered = nums[14];
          data.C_recovered = nums[15];
          data.M_total = nums[9];
          data.C_total = nums[10];
        }

        XtenseRequest.set('gamedata', data);
        XtenseRequest.set('type', 'messages');
        XtenseRequest.send();
        log.info("Message court Recyclage envoyé");
      }
    }
    // Expeditions
    else if ((storageGetValue("handle.msg.expeditions").toString() === 'true') && msgContent.match(new RegExp(locales.expeditionResult + XtenseRegexps.planetCoords))) {

      log.info("Message court Expédition détecté");
      let m = msgContent.match(new RegExp(locales.expeditionResult + XtenseRegexps.planetCoords));
      let content = Xpath.getOrderedSnapshotNodes(document, paths.shortmsgcontent, shortMessageNode);

      if (m != null && content.snapshotLength > 0) {
        let data = {};
        let coords = m[1];
        content = content.snapshotItem(0).textContent.trim();
        data.type = tab_type;
        data.coords = coords;
        data.content = content;
        data.date = XtenseParseDate(msgContent, glang('dates').messages);

        XtenseRequest.set('gamedata', data);
        XtenseRequest.set('type', 'messages');
        XtenseRequest.send();
        log.info("Message court Expédition envoyé");
      }
    } // Espionnages
    else if ((storageGetValue("handle.msg.spy").toString() === 'true') && msgContent.match(new RegExp(locales['espionage of'] + XtenseRegexps.planetNameAndCoords))) {
      log.info("Message court Espionnage détecté");

      let planetName = '';
      let m = msgContent.match(new RegExp(locales['espionage of'] + XtenseRegexps.planetNameAndCoords));
      if (m) {
        let fullplanetName = m[1].match(/Planète (.*)/);
        planetName = fullplanetName ? fullplanetName[1] : m[1];
        log.debug("Planet Name: " + planetName);
        // Utilise planetName ici
      }

      log.debug(shortMessageNode);

      let proba = Xpath.getStringValue(document, './/div[contains(@class,"msgFilteredHeaderCell_counterEspionageChance")]/text()', shortMessageNode);
      let activity = Xpath.getStringValue(document, './/div[contains(@class,"msgFilteredHeaderCell_activity")]/text()', shortMessageNode);

      let rawDataElement = shortMessageNode.querySelector('.rawMessageData');

      let rawData = {
        type: 'spy',
        proba: proba.trimInt().toString(),
        activity:  activity.trimInt().toString(),
        date: rawDataElement.getAttribute('data-raw-timestamp'),
        player: {
          name: rawDataElement.getAttribute('data-raw-playername'),
          status: rawDataElement.getAttribute('data-raw-status'),
          /*ranking: {
            total: rawDataElement.getAttribute('data-raw-highscoretotal'),
            economy: rawDataElement.getAttribute('data-raw-highscoreeconomy'),
            military: rawDataElement.getAttribute('data-raw-highscoremilitary'),
            research: rawDataElement.getAttribute('data-raw-highscoreresearch'),
            lifeForms: rawDataElement.getAttribute('data-raw-highscorelifeforms'),
          },*/
          class: {
            character: parseJSONAttribute(rawDataElement,'data-raw-characterclass'),
            alliance: parseJSONAttribute(rawDataElement,'data-raw-allianceclass'),
          },
        },
        planet: {
          name: planetName.toString(),
          coordinates: rawDataElement.getAttribute('data-raw-coordinates'),
          type: rawDataElement.getAttribute('data-raw-targetplanettype'),
          id: rawDataElement.getAttribute('data-raw-targetplanetid'),
        },
        resources: {
          metal: rawDataElement.getAttribute('data-raw-metal'),
          crystal: rawDataElement.getAttribute('data-raw-crystal'),
          deuterium: rawDataElement.getAttribute('data-raw-deuterium'),
          loot: rawDataElement.getAttribute('data-raw-loot'),
        },
        buildings: parseJSONAttribute(rawDataElement,'data-raw-buildings', {}),
        lfBuildings: parseJSONAttribute(rawDataElement,'data-raw-lfbuildings', {}),
        research: parseJSONAttribute(rawDataElement,'data-raw-research', {}),
        lfResearch: parseJSONAttribute(rawDataElement, 'data-raw-lfresearch', {}),
        fleet: parseJSONAttribute(rawDataElement, 'data-raw-fleet', {}),
        defense: parseJSONAttribute(rawDataElement,'data-raw-defense', {}),
      };



      console.log(rawData);

      XtenseRequest.set('gamedata', rawData);
      XtenseRequest.set('type', 'messages');
      XtenseRequest.send();
      // Ogame API
      /*let ogameAPITitle = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.messages.ogameapi, shortMessageNode).snapshotItem(0).value;
      let regexApi = new RegExp(XtenseRegexps.ogameapi);
      let ogameAPILink = regexApi.exec(ogameAPITitle)[1];*/
    }

    // Marquer ce message comme traité
    lastProcessedIds.push(idmsg);
    // Garder seulement les 100 derniers IDs pour éviter une croissance infinie
    if (lastProcessedIds.length > 100) {
      lastProcessedIds = lastProcessedIds.slice(-100);
    }
    storageSetValue("lastProcessedMessageIds", JSON.stringify(lastProcessedIds));

    // TODO : Cas de perte de contact avec la flotte attaquante
  }

  // Sauvegarder les tailles pour éviter le retraitement
  storageSetValue('lastShtMsgsSize', messagesCourt.snapshotLength);
  storageSetValue('lastMsgsSize', messages.snapshotLength);
}

function parseJSONAttribute(rawDataElement, attributeName, defaultValue = null) {
  const attribute = rawDataElement.getAttribute(attributeName);

  // Vérifier si l'attribut existe et n'est pas vide
  if (!attribute) {
    return defaultValue;
  }

  // Vérifier si c'est juste un tiret (valeur par défaut d'OGame pour "pas de données")
  if (attribute === '-' || attribute.trim() === '') {
    return defaultValue;
  }

  try {
    // Remplacer les entités HTML et parser le JSON
    return JSON.parse(attribute.replace(/&quot;/g, '"'));
  } catch (error) {
    // Si le parsing JSON échoue, logger l'erreur et retourner la valeur par défaut
    log.debug(`Erreur lors du parsing JSON de l'attribut ${attributeName}: ${error.message}, valeur: "${attribute}"`);
    return defaultValue;
  }
}

/**
 * Parse les messages détaillés
 * @param messages
 * @returns {boolean}
 */
function parse_detail_messages(messages) {
  // Pas de messages à traiter
  if (messages == null || messages.snapshotLength === 0)
    return false;

  let paths = XtenseXpaths.messages;
  let messageNode = messages.snapshotItem(0);
  // Recupere l'id du message detaille
  let messageId = Xpath.getStringValue(document, paths.messageid, messageNode);
  log.debug("Message Long messageid : " + messageId);

  /* if (storageGetValue("lastAction", '').toString() === "message:" + messageId)
     return false;*/

  log.info("Traitement du message Long");
  storageSetValue('lastAction', "message:" + messageId);
  let locales = glang('messages');

  let data = {};
  let from = Xpath.getSingleNode(document, paths.from, messageNode).textContent.trim();
  let subject = Xpath.getStringValue(document, paths.subject, messageNode).trim();
  let date = Xpath.getStringValue(document, paths.date, messageNode).trim();

  data.date = XtenseParseDate(date, glang('dates').messages);
  data.type = '';

  // Messages de joueurs
  if (storageGetValue("handle.msg.msg").toString() === 'true') {
    let userName;
    let coords;

    if (Xpath.getOrderedSnapshotNodes(document, paths.reply, messageNode).snapshotLength > 0) { // si bouton "repondre", c'est un mp
      log.info("Message privé détecté");
      let m = from.match(new RegExp(XtenseRegexps.userNameAndCoords));
      if (m) {
        userName = m[1];
        coords = m[2];
      }
      let message = Xpath.getOrderedSnapshotNodes(document, paths.contents.msg, messageNode).snapshotItem(0).textContent.trim();

      data.type = 'msg';
      data.from = userName;
      data.coords = coords;
      data.subject = subject;
      data.message = message;

      XtenseRequest.set('gamedata', data);
      XtenseRequest.set('type', 'messages');
      XtenseRequest.send();
      log.info("Message Privé envoyé");

    } else {
      log.debug('The message is not a private message');
    }
  }

  // Messages d'alliance
  if (storageGetValue("handle.msg.ally").toString() === 'true') {
    let m = from.match(new RegExp(XtenseRegexps.ally));
    if (m) {
      log.info("Message alliance détecté");
      let contentNode = Xpath.getSingleNode(document, paths.contents.ally_msg, messageNode);
      let message = contentNode.innerHTML.replace(new RegExp(XtenseRegexps.ally_msg_player_name, "g"), "$1");
      if (message.search("<") > -1 && message.search(">") > -1) message = contentNode.textContent.trim(); // patch des tag html qui bloquent l'envoi

      data.type = 'ally_msg';
      data.from = m[1];
      data.tag = m[1];
      data.message = message;

      XtenseRequest.set('gamedata', data);
      XtenseRequest.set('type', 'messages');
      XtenseRequest.send();
      log.info("Message Alliance envoyé");
    } else {
      log.debug('The message is not an ally message');
    }
  }

  // Espionnages ennemis
  // TODO : Reporter le parsing msg court ici si possible
  if (storageGetValue("handle.msg.ennemy.spy").toString() === 'true') {
    if (subject.match(new RegExp(locales['espionnage action']))) {
      log.info("Message espionnage ennemi détecté");

      let contentNode = Xpath.getSingleNode(document, paths.contents.ennemy_spy);
      let rawdata = contentNode.textContent.trim();
      let m = rawdata.match(new RegExp(XtenseRegexps.messages.ennemy_spy));

      let rawdata2 = contentNode.innerHTML.trim();
      let m2 = rawdata2.match(new RegExp(XtenseRegexps.messages.ennemy_spy_moon));

      if (m) {
        data.type = 'ennemy_spy';
        data.from = m[1];
        data.to = m[2];
        if (m2) {
          data.toMoon = 0;
          if (m2[2].match(new RegExp(locales.moon))) {
            data.toMoon = 1;
          }
          data.fromMoon = 0;
          if (m2[1].match(new RegExp(locales.moon))) {
            data.fromMoon = 1;
          }
        }
        data.proba = m[3];

        XtenseRequest.set('gamedata', data);
        XtenseRequest.set('type', 'messages');
        XtenseRequest.send();
      }
    } else {
      //log.info('The message is not an ennemy spy');
    }
  }

  //RC
  if (storageGetValue("handle.msg.rc").toString() === 'true') {

    let combatreportId = -1;
    // Recupere l'id du rapport de combat detaille
    combatreportId = Xpath.getStringValue(document, paths.combatreport, messageNode);

    // Si il s'agit d'un message detaille de Rapport de Combat
    if (combatreportId != null && combatreportId != '') {
      log.info("Traitement du rapport de combat (" + combatreportId + ")");

      let scriptNode = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.rc.script, null).snapshotItem(0);
      parse_rc(document, scriptNode);
      return true;
    }

  }

  // Recyclages
  if (storageGetValue("handle.msg.rc.cdr").toString() === 'true') {

    if (from.match(new RegExp(locales.fleet)) && subject.match(new RegExp(locales.harvesting))) {
      let m = subject.match(new RegExp(XtenseRegexps.coords));
      if (m) {
        log.info("Message Recyclage détecté");
        let coords = m[1];
        let message = Xpath.getStringValue(document, paths.contents.rc_cdr).trim();
        let nums = message.getInts();
        data.type = 'rc_cdr';
        data.coords = coords;
        data.nombre = nums[0];
        data.M_recovered = nums[7];
        data.C_recovered = nums[8];
        data.M_total = nums[2];
        data.C_total = nums[3];

        XtenseRequest.set('gamedata', data);
        XtenseRequest.set('type', 'messages');
        XtenseRequest.send();
      }
    } else {
      //log.info('The message is not a harvesting report');
    }
  }

  // Expeditions
  if (storageGetValue("handle.msg.expeditions").toString() === 'true') {
    let m = subject.match(new RegExp(locales['expedition result'] + XtenseRegexps.planetCoords));
    let m2 = from.match(new RegExp(locales['fleet command']));

    if (m2 != null && m != null) {
      log.info("Message Expédition détecté");
      let coords = m[1];
      let message = Xpath.getStringValue(document, paths.contents.expedition).trim();
      data.type = get_tabid();
      data.coords = coords;
      data.content = message;

      XtenseRequest.set('gamedata', data);
      XtenseRequest.set('type', 'messages');
      XtenseRequest.send();

    } else {
      //log.info('The message is not an expedition report');
    }
  }
  // Aucun message pour Affichage Xtense
  if (data.type === '' && data.json === '') {
    setStatus(XLOG_NORMAL, xlang('no_messages'));
    return false;
  }

  storageSetValue('lastMsgsSize', messages.snapshotLength); //Pour detection nouveau message
}

/* Page Battle Report */
function parse_rc(doc, script) {

  let paths = XtenseXpaths.rc;
  log.info('Traitement du rapport de combat détaillé');

  let jsonRegex = new RegExp(/jQuery.parseJSON\('(.*)'\);/);
  let resultRegex = jsonRegex.exec(script.innerHTML);
  log.info(resultRegex[1]);
  if (resultRegex.length !== 2) {
    log.error('Erreur lors de la récupération du json');
    return false;
  }

  let infos = Xpath.getOrderedSnapshotNodes(document, paths.list_infos, null);
  if (infos.snapshotLength > 0) {
    let infosNode = infos.snapshotItem(0);

    // Ogame API
    let apiNode = Xpath.getOrderedSnapshotNodes(doc, XtenseXpaths.messages.ogameapi, infosNode).snapshotItem(0);
    let ogameAPILink = null;
    if (apiNode != null) {
      let ogameAPITitle = apiNode.value;
      let regexApi = new RegExp(XtenseRegexps.ogameapi);
      ogameAPILink = regexApi.exec(ogameAPITitle)[1];
    }

    let type = get_tabid();

    XtenseRequest.set('type', type);
    XtenseRequest.set('gamedata', {
      json: resultRegex[1],
      ogapilnk: ogameAPILink
    });
    XtenseRequest.send();
    log.info("Message " + 'Combat Report' + "sent");
  }
}
