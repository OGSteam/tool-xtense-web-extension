/**
 * Created by Itori on 31/08/2016.
 */


function get_tabid() {
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

    return type;
}


/* Page Messages */

function parse_messages() {
    setStatus(XLOG_NORMAL, Xl('messages_detected'));
    var paths = XtenseXpaths.messages;
    var messages = Xpath.getOrderedSnapshotNodes(document, paths.showmessage, null);
    var messagesCourt = Xpath.getOrderedSnapshotNodes(document, paths.shortmessages, null);

    //log('Nombre Messages courts: ' + messagesCourt.snapshotLength);
    //log('Nombre Messages classiques: ' + messages.snapshotLength);

    // Traitement des listes de messages court (déclenche lorsque le nombre de messages détecté change)
    parse_short_messages(messagesCourt, messages);

    //log("Traitement d'un message detaille");
    // Traitement d'un message detaille (declenche lorsque l'on affiche le detail d'un message ou lorsque l'on change de page de msg detaille)
    parse_detail_messages(messages);
}

function parse_short_messages(messagesCourt, messages) {
    let paths = XtenseXpaths.messages;
    let lastShtMsgsSize = GM_getValue("lastShtMsgsSize", 0);
    let lastMsgsSize = GM_getValue("lastMsgsSize", 0);

    // Pas de messages à traiter
    if (messagesCourt.snapshotLength === 0) {
        log('Pas de messages à traiter');
        return;
    }
    // Si le nombre de messages présent est le même que lors du dernier traitement
    // On considère qu'il n'y a pas de nouveaux messages
    if (messagesCourt.snapshotLength === lastShtMsgsSize && messages.snapshotLength === lastMsgsSize){
        log('Pas de nouveaux messages');
        return;
    }
    // On regarde si le dernier message traité correspond au nombre de message
    // Pas trop sûr de savoir à quoi ça sert
    /** if ((GM_getValue("last_shortmessage", 0).toString()) === messagesCourt.snapshotLength.toString()) {
        log('Id identique');
        return;
    }*/
    GM_setValue("last_shortmessage", messagesCourt.snapshotLength);

    let locales = l('messages');
    let tab_type = get_tabid(document);

    // Parcours de la liste de messages court
    // TODO : Ne pas re-parcourir les messages court deja parse
    for (let cptShtMsg = 0; cptShtMsg < messagesCourt.snapshotLength; cptShtMsg++) {
        let shortMessageNode = messagesCourt.snapshotItem(cptShtMsg);
        let msgContent = shortMessageNode.textContent.trim();
        // Recupere l'id du message court
        let idmsg = shortMessageNode.attributes['data-msg-id'].value;
        log("ID Message court : " + idmsg);
        /*Récupération API */
        //*[@id="messages"]/div[9]/div[3]/div/input

        // Espionnage ennemi
        if ((GM_getValue("handle.msg.ennemy.spy").toString() === 'true') && msgContent.match(new RegExp(locales['espionnage action']))) {

            log("Message court Espionnage Ennemi détecté : ");
            let ToInfo = msgContent.match(new RegExp(XtenseRegexps.messages.ennemy_spy_to));
            let proba = msgContent.match(new RegExp(XtenseRegexps.messages.ennemy_spy_proba));

            if (ToInfo) {
                let data = {};

                data.type = 'ennemy_spy';
                data.to = ToInfo[1];
                data.proba = proba[1];
                let msgInnerHTML = shortMessageNode.innerHTML.trim();
                //log(msgInnerHTML);

                //Données de la planètre ciblées
                data.toMoon = 0;
                let moonTo = msgInnerHTML.match(new RegExp(XtenseRegexps.messages.ennemy_spy_moon));
                if (moonTo) { //Cas où la lune est absente
                    if (moonTo[1] === 'moon') {
                        data.toMoon = 1;
                    }
                }
                //Données de la planètre origine
                fromdetails = msgInnerHTML.match(new RegExp(XtenseRegexps.messages.ennemy_spy_from));
                if (fromdetails) {
                    data.from = fromdetails[1] + ':' + fromdetails[2] + ':' + fromdetails[3];
                    data.fromMoon = 0;
                    if (fromdetails[4] === 3) { //3 is mission type for luna
                        data.fromMoon = 1;
                    }
                }
                //data.proba = fromToInfo[3];
                data.date = XtenseParseDate(msgContent, l('dates')['messages']);
                XtenseRequest.set('data', data);
                XtenseRequest.set('type', 'messages');
                XtenseRequest.send();
                log("Short Message Ennemy spy report sent from " + data.from + " to " + data.to);
                //}
            }
        }

        // Recyclage
        else if ((GM_getValue("handle.msg.rc.cdr").toString() === 'true') && msgContent.match(new RegExp(locales['fleet'])) && msgContent.match(new RegExp(locales['harvesting']))) { //OK
            log("Message court Recyclage détecté");
            let m = msgContent.match(new RegExp(XtenseRegexps.coords));
            if (m) {
                let data = {};
                let coords = m[1];
                let nums = msgContent.getInts();

                data.type = 'rc_cdr';
                data.coords = coords;
                data.date = XtenseParseDate(msgContent, l('dates')['messages']);

                if (msgContent.match(new RegExp(locales['antimatiere']))) {
                    data.AM_total = nums[10];
                    data.AM_recovered = nums[11];
                } else {
                    data.nombre = nums[7];
                    data.M_recovered = nums[14];
                    data.C_recovered = nums[15];
                    data.M_total = nums[9];
                    data.C_total = nums[10];
                }

                XtenseRequest.set('data', data);
                XtenseRequest.set('type', 'messages');
                XtenseRequest.send();
                log("Message court Recyclage envoyé");
            }
        }
        // Expeditions
        else if ((GM_getValue("handle.msg.expeditions").toString() === 'true') && msgContent.match(new RegExp(locales['expedition result'] + XtenseRegexps.planetCoords))) {

            log("Message court Expédition détecté : ");
            let m = msgContent.match(new RegExp(locales['expedition result'] + XtenseRegexps.planetCoords));
            let content = Xpath.getOrderedSnapshotNodes(document, paths.shortmsgcontent, shortMessageNode);

            if (m != null && content.snapshotLength > 0) {
                let data = {};
                let coords = m[1];
                content = content.snapshotItem(0).textContent.trim();
                data.type = tab_type;
                data.coords = coords;
                data.content = content;
                data.date = XtenseParseDate(msgContent, l('dates')['messages']);

                XtenseRequest.set('data', data);
                XtenseRequest.set('type', 'messages');
                XtenseRequest.send();
                log("Message court Expédition envoyé");
            }
        } // Espionnages
        else if ((GM_getValue("handle.msg.spy").toString() === 'true') && msgContent.match(new RegExp(locales['espionage of'] + XtenseRegexps.planetNameAndCoords))) {
            // Ogame API
            /*var ogameAPITitle = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.messages.ogameapi, shortMessageNode).snapshotItem(0).value;
            var regexApi = new RegExp(XtenseRegexps.ogameapi);
            var ogameAPILink = regexApi.exec(ogameAPITitle)[1];*/
        }

        // TODO : Cas de perte de contact avec la flotte attaquante
    }

    GM_setValue('lastShtMsgsSize', messagesCourt.snapshotLength); //Pour detection nouveau message
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
    log("Message Long messageid : " + messageId);

    if (GM_getValue("lastAction", '').toString() === "message:" + messageId)
        return false;

    log("Traitement du message");
    GM_setValue('lastAction', "message:" + messageId);
    let locales = l('messages');

    let data = {};
    let from = Xpath.getSingleNode(document, paths.from, messageNode).textContent.trim();
    let to = Xpath.getStringValue(document, paths.to, messageNode).trim();
    let subject = Xpath.getStringValue(document, paths.subject, messageNode).trim();
    let date = Xpath.getStringValue(document, paths.date, messageNode).trim();

    data.date = XtenseParseDate(date, l('dates')['messages']);
    data.type = '';

    // Messages de joueurs
    if (GM_getValue("handle.msg.msg").toString() === 'true') {
        if (Xpath.getOrderedSnapshotNodes(document, paths.reply, messageNode).snapshotLength > 0) { // si bouton "repondre", c'est un mp
            log("Message privé détecté");
            let m = from.match(new RegExp(XtenseRegexps.userNameAndCoords));
            if (m) {
                let userName = m[1];
                let coords = m[2];
            }
            let message = Xpath.getOrderedSnapshotNodes(document, paths.contents['msg'], messageNode).snapshotItem(0).textContent.trim();

            data.type = 'msg';
            data.from = userName;
            data.coords = coords;
            data.subject = subject;
            data.message = message;
        } else {
            //log('The message is not a private message');
        }
    }

    // Messages d'alliance
    if (GM_getValue("handle.msg.ally").toString() === 'true') {
        let m = from.match(new RegExp(XtenseRegexps.ally));
        if (m) {
            log("Message alliance détecté");
            let contentNode = Xpath.getSingleNode(document, paths.contents['ally_msg'], messageNode);
            let message = contentNode.innerHTML.replace(new RegExp(XtenseRegexps.ally_msg_player_name, "g"), "$1");
            if (message.search("<") > -1 && message.search(">") > -1) message = contentNode.textContent.trim(); // patch des tag html qui bloquent l'envoi

            data.type = 'ally_msg';
            data.from = m[1];
            data.tag = m[1];
            data.message = message;
        } else {
            //log('The message is not an ally message');
        }
    }


    // Espionnages perso
    if (GM_getValue("handle.msg.spy").toString() === 'true') {
        let m = subject.match(new RegExp(locales['espionage of'] + XtenseRegexps.planetNameAndCoords));
        if (m) {
            log("Message espionnage détecté");

            let contentNode = Xpath.getSingleNode(document, paths.contents['spy']);
            let content = contentNode.innerHTML;

            data.planetName = m[1].trim();
            data.coords = m[2];

            m = content.match(new RegExp(locales['unespionage prob'] + XtenseRegexps.probability));
            if (m)
                data.proba = m[1];
            else data.proba = 0;

            data.activity = 0;
            m = content.match(new RegExp(locales['activity']));
            if (m)
                data.activity = m[1];

            Ximplements(data, parse_spy_report(content));
            data.type = get_tabid(document);

        } else {
            //log('The message is not a spy report');
        }
    }

    // Espionnages ennemis
    // TODO : Reporter le parsing msg court ici si possible
    if (GM_getValue("handle.msg.ennemy.spy").toString() === 'true') {
        if (subject.match(new RegExp(locales['espionnage action']))) {
            log("Message espionnage ennemi détecté");

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
                    if (m2[2].match(new RegExp(locales['moon']))) {
                        data.toMoon = 1;
                    }
                    data.fromMoon = 0;
                    if (m2[1].match(new RegExp(locales['moon']))) {
                        data.fromMoon = 1;
                    }
                }
                data.proba = m[3];
            }
        } else {
            //log('The message is not an ennemy spy');
        }
    }

    //RC
    if (GM_getValue("handle.msg.rc").toString() === 'true') {

        let combatreportId = -1;
        // Recupere l'id du rapport de combat detaille
        combatreportId = Xpath.getStringValue(document, paths.combatreport, messageNode);

        // Si il s'agit d'un message detaille de Rapport de Combat
        if (combatreportId != null && combatreportId !== '') {
            log("Traitement du rapport de combat (" + combatreportId + ")");

            let scriptNode = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.rc.script, null).snapshotItem(0);
            parse_rc(document, scriptNode);
            return true;
        }

    }

    // Recyclages
    if (GM_getValue("handle.msg.rc.cdr").toString() === 'true') {

        if (from.match(new RegExp(locales['fleet'])) && subject.match(new RegExp(locales['harvesting']))) {
            let m = subject.match(new RegExp(XtenseRegexps.coords));
            if (m) {
                log("Message Recyclage détecté");
                let coords = m[1];
                let contentNode = Xpath.getSingleNode(document, paths.contents.rc_cdr);
                let message = Xpath.getStringValue(document, paths.contents.rc_cdr).trim();
                let nums = message.getInts();
                data.type = 'rc_cdr';
                data.coords = coords;
                data.nombre = nums[0];
                data.M_recovered = nums[7];
                data.C_recovered = nums[8];
                data.M_total = nums[2];
                data.C_total = nums[3];
            }
        } else {
            //log('The message is not a harvesting report');
        }
    }

    // Expeditions
    if (GM_getValue("handle.msg.expeditions").toString() === 'true') {
        let m = subject.match(new RegExp(locales['expedition result'] + XtenseRegexps.planetCoords));
        let m2 = from.match(new RegExp(locales['fleet command']));

        if (m2 != null && m != null) {
            log("Message Expédition détecté");
            let coords = m[1];
            let contentNode = Xpath.getSingleNode(document, paths.contents['expedition']);
            let message = Xpath.getStringValue(document, paths.contents['expedition']).trim();
            data.type = get_tabid(document);
            data.coords = coords;
            data.content = message;
        } else {
            //log('The message is not an expedition report');
        }
    }
    // Aucun message
    if (data.type === '' && data.json === '') {
        setStatus(XLOG_NORMAL, Xl('no_messages'));
        return false;
    } else {

        XtenseRequest.set({
            type: 'messages',
            lang: langUnivers,
            data: data
        });
        XtenseRequest.send();
        log("Message " + data.type + "sent");
    }

    GM_setValue('lastMsgsSize', messages.snapshotLength); //Pour detection nouveau message
}

/* Page Battle Report */
function parse_rc(doc, script) {

    let paths = XtenseXpaths.rc;
    log('Traitement du rapport de combat détaillé');

    let jsonRegex = new RegExp(/jQuery.parseJSON\('(.*)'\);/);
    let resultRegex = jsonRegex.exec(script.innerHTML);
    log(resultRegex[1]);
    if(resultRegex.length !== 2) {
        log('Erreur lors de la récupération du json');
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

        let type = get_tabid(doc);

        XtenseRequest.set({
            data: null,
            type: type,
            json: resultRegex[1],
            ogapilnk: ogameAPILink
        });
        XtenseRequest.send();
        log("Message " + 'Combat Report' + "sent");
        GM_setValue('lastMsgsSize', messages.snapshotLength); //Pour detection nouveau message

    }
}


/* Fonction de parsing d'un RE */

function parse_spy_report(RE) {
    setStatus(XLOG_NORMAL, Xl('re_detected'));
    let paths = XtenseXpaths.messages.spy;
    let spyStrings = l('spy reports');
    let locales = l('messages');
    let infosNode; // Default value ?

    let infos = Xpath.getOrderedSnapshotNodes(document, paths.list_infos, null);
    if (infos.snapshotLength > 0) {
        infosNode = infos.snapshotItem(0);
    }

    let data = {};
    let typs = [];
    let res = [];

    let attackRef = Xpath.getStringValue(document, paths.moon);
    let isMoon = attackRef.search('type=3') > -1;
    let playerName = Xpath.getSingleNode(document, paths.playername).textContent.trim();
    let types = Xpath.getOrderedSnapshotNodes(document, paths.materialfleetdefbuildings);
    for (let i in spyStrings['units']) {
        for (let k = 0; k < types.snapshotLength; k++) {
            if (types.snapshotItem(k).textContent.trim().match(new RegExp(spyStrings['groups'][i], 'gi'))) {
                log("Groupe Trouvé = " + types.snapshotItem(k).textContent.trim());
                if (k++ < types.snapshotLength) {
                    for (let z = k; z < types.snapshotLength; z++) {
                        let finish = false;
                        for (let units in spyStrings['units']) {
                            if (types.snapshotItem(z).textContent.trim().match(new RegExp(spyStrings['groups'][units], 'gi'))) {
                                finish = true;
                                k = z - 1;
                                break;
                            }
                        }
                        if (finish) {
                            //alert("Groupe FINISH");
                            break;
                        }

                        if (types.snapshotItem(z).title != null && types.snapshotItem(z).title.trim() !== '') {
                            for (let j in spyStrings['units'][i]) {
                                if (types.snapshotItem(z).innerHTML.match(new RegExp(spyStrings['units'][i][j], 'gi'))) {
                                    data[XtenseDatabase[i][j]] = types.snapshotItem(z).title.trim().replace(/\./g, '');
                                    log("R="+XtenseDatabase[i][j] + " = " + data[XtenseDatabase[i][j]]);
                                }
                            }
                        } else {
                            for (let j in spyStrings['units'][i]) {
                                let m = getElementInSpyReport(types.snapshotItem(z).textContent.trim(), spyStrings['units'][i][j]);

                                if (m > -1) {
                                    data[XtenseDatabase[i][j]] = m;
                                    log("BT="+spyStrings['units'][i][j] + " = " + data[XtenseDatabase[i][j]]);
                                }
                            }
                        }
                    }
                } else {
                    break;
                }
            }
        }
    }

    // Ogame API
    let ogameAPITitle = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.messages.ogameapi, infosNode).snapshotItem(0).value;
    let regexApi = new RegExp(XtenseRegexps.ogameapi);
    let ogameAPILink = regexApi.exec(ogameAPITitle)[1];

    return {
        content: data,
        playerName: playerName,
        moon: isMoon,
        ogapilnk: ogameAPILink
    };
}

/* Fonction de récupération de données dans un RE */

function getElementInSpyReport(RE, elem) {
    let num = -1;
    let reg = new RegExp(elem + '\\D+(\\d[\\d.]*)'); // (\D+)(.\d*(\,|\.)\d*\w{1})
    //recupere le nombre le plus proche apres le texte
    let m = reg.exec(RE);
    //log(RE);
    if (m)
        num = m[1].trimInt();
    //log(elem + " : " + num);
    return num;
}
