/**
 * Created by Itori on 31/08/2016.
 */


function get_tabid(doc) {
    var current_tab = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.messages.tab);

    var tab_id = current_tab.snapshotItem(0).value;

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
    }

    return type;
}


/* Page Messages */

function parse_messages() {
    setStatus(XLOG_NORMAL, Xl('messages_detected'));
    var paths = XtenseXpaths.messages;
    var data = {};

    var lastShtMsgsSize = GM_getValue('lastShtMsgsSize', 0);
    var lastMsgsSize = GM_getValue('lastMsgsSize', 0);

    var messages = Xpath.getOrderedSnapshotNodes(document, paths.showmessage, null);
    var messagesCourt = Xpath.getOrderedSnapshotNodes(document, paths.shortmessages, null);

    //log('Nombre Messages courts: ' + messagesCourt.snapshotLength);
    //log('Nombre Messages classiques: ' + messages.snapshotLength);

    // Traitement des listes de messages court (déclenche lorsque le nombre de messages détecté change)
    if (messagesCourt.snapshotLength > 0 && messagesCourt.snapshotLength != lastShtMsgsSize || messages.snapshotLength != lastMsgsSize) {
        if ((GM_getValue("last_shortmessage", 0).toString()) != messagesCourt.snapshotLength) {
            GM_setValue("last_shortmessage", messagesCourt.snapshotLength);
            var locales = l('messages');

            var tab_type = get_tabid(document);

            // Parcours de la liste de messages court
            // TODO : Ne pas re-parcourir les messages court deja parse
            for (var cptShtMsg = 0; cptShtMsg < messagesCourt.snapshotLength; cptShtMsg++) {
                var shortMessageNode = messagesCourt.snapshotItem(cptShtMsg);
                var msgContent = shortMessageNode.textContent.trim();
                // Recupere l'id du message court
                var idmsg = shortMessageNode.attributes['data-msg-id'].value;
                log("ID Message court : " + idmsg);
                /*Récupération API */
                //*[@id="messages"]/div[9]/div[3]/div/input

                // Espionnage ennemi
                if ((GM_getValue('handle.msg.ennemy.spy').toString() == 'true') && msgContent.match(new RegExp(locales['espionnage action']))) {

                    log("Message court Espionnage Ennemi détecté : ");
                    var ToInfo = msgContent.match(new RegExp(XtenseRegexps.messages.ennemy_spy_to));
                    var proba = msgContent.match(new RegExp(XtenseRegexps.messages.ennemy_spy_proba));

                    if (ToInfo) {
                        var data = {};

                        data.type = 'ennemy_spy';
                        data.to = ToInfo[1];
                        data.proba = proba[1];
                        var msgInnerHTML = shortMessageNode.innerHTML.trim();
                        //log(msgInnerHTML);

                        //Données de la planètre ciblées
                        data.toMoon = 0;
                        var moonTo = msgInnerHTML.match(new RegExp(XtenseRegexps.messages.ennemy_spy_moon));
                        if (moonTo) { //Cas où la lune est absente
                            if (moonTo[1] == 'moon') {
                                data.toMoon = 1;
                            }
                        }
                        //Données de la planètre origine
                        fromdetails = msgInnerHTML.match(new RegExp(XtenseRegexps.messages.ennemy_spy_from));
                        if (fromdetails) {
                            data.from = fromdetails[1] + ':' + fromdetails[2] + ':' + fromdetails[3];
                            data.fromMoon = 0;
                            if (fromdetails[4] == 3) { //3 is mission type for luna
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
                else if ((GM_getValue('handle.msg.rc.cdr').toString() == 'true') && msgContent.match(new RegExp(locales['fleet'])) && msgContent.match(new RegExp(locales['harvesting']))) { //OK
                    log("Message court Recyclage détecté");
                    var m = msgContent.match(new RegExp(XtenseRegexps.coords));
                    if (m) {
                        var data = {};
                        var coords = m[1];
                        var nums = msgContent.getInts();

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
                else if ((GM_getValue('handle.msg.expeditions').toString() == 'true') && msgContent.match(new RegExp(locales['expedition result'] + XtenseRegexps.planetCoords))) {

                    log("Message court Expédition détecté : ");
                    var m = msgContent.match(new RegExp(locales['expedition result'] + XtenseRegexps.planetCoords));
                    var content = Xpath.getOrderedSnapshotNodes(document, paths.shortmsgcontent, shortMessageNode);

                    if (m != null && content.snapshotLength > 0)
                    {



                        var data = {};
                        var coords = m[1];
                        var content = content.snapshotItem(0).textContent.trim();
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
                else if ((GM_getValue('handle.msg.spy').toString() == 'true') && msgContent.match(new RegExp(locales['espionage of'] + XtenseRegexps.planetNameAndCoords))) {
                    // Ogame API
                    var ogameAPITitle = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.messages.ogameapi, shortMessageNode).snapshotItem(0).value;
                    var regexApi = new RegExp(XtenseRegexps.ogameapi);
                    var ogameAPILink = regexApi.exec(ogameAPITitle)[1];
                }

                // TODO : Cas de perte de contact avec la flotte attaquante
            }
        }
    }

    //log("Traitement d'un message detaille");
    // Traitement d'un message detaille (declenche lorsque l'on affiche le detail d'un message ou lorsque l'on change de page de msg detaille)
    if (messages.snapshotLength > 0) {
        var messageNode = messages.snapshotItem(0);
        // Recupere l'id du message detaille
        var messageId = Xpath.getStringValue(document, paths.messageid, messageNode);
        log("Message Long messageid : " + messageId);
        var combatreportId = -1;
        // Recupere l'id du rapport de combat detaille
        combatreportId = Xpath.getStringValue(document, paths.combatreport, messageNode);
        log("Message Long combatreportId : " + combatreportId);
        // Si il s'agit d'un message detaille de Rapport de Combat
        if (combatreportId != null && combatreportId != '') {
            if (GM_getValue('lastAction', '').toString() != "combatreport:" + combatreportId) {
                // Empeche les evenements en chaine
                GM_setValue('lastAction', "combatreport:" + combatreportId);
                log("Traitement du rapport de combat (" + combatreportId + ")");
                //--------------------------------------
                // Recupere la liste des messages court
                var messagesShort = Xpath.getOrderedSnapshotNodes(document.body.ownerDocument, paths.shortmessages, null);
                var messageShort = null;
                var messageShortFound = null;

                if (messagesShort.snapshotLength > 0) {
                    // Parcours la liste des messages court
                    for (var index = 0; index < messagesShort.snapshotLength; index++) {
                        messageShort = messagesShort.snapshotItem(index);
                        if (messageShort.attributes != null && messageShort.attributes.length > 0) {
                            // Recupere l'id du message court
                            var idmsg = messageShort.attributes['data-msg-id'];
                            // Si l'id du message court est le meme que l'id du message detaille
                            if (idmsg != null && idmsg.value != '' && idmsg.value == messageId) {
                                // On a trouve le message court correspondant au message detaille
                                messageShortFound = messageShort;
                                // On arrete de chercher
                                break;
                            }
                        }
                    }
                }
                //--------------------------------------
                parse_rc(document, messageShortFound.textContent);
            }
        } else if (GM_getValue('lastAction', '').toString() != "message:" + messageId) {
            log("Traitement du message");
            GM_setValue('lastAction', "message:" + messageId);
            var locales = l('messages');

            var data = {};
            var from = Xpath.getSingleNode(document, paths.from, messageNode).textContent.trim();
            var to = Xpath.getStringValue(document, paths.to, messageNode).trim();
            var subject = Xpath.getStringValue(document, paths.subject, messageNode).trim();
            var date = Xpath.getStringValue(document, paths.date, messageNode).trim();

            data.date = XtenseParseDate(date, l('dates')['messages']);
            data.type = '';

            // Messages de joueurs
            if (GM_getValue('handle.msg.msg').toString() == 'true') {
                log("Message privé détecté");
                if (Xpath.getOrderedSnapshotNodes(document, paths.reply, messageNode).snapshotLength > 0) { // si bouton "repondre", c'est un mp
                    var m = from.match(new RegExp(XtenseRegexps.userNameAndCoords));
                    if (m) {
                        var userName = m[1];
                        var coords = m[2];
                    }
                    var message = Xpath.getOrderedSnapshotNodes(document, paths.contents['msg'], messageNode).snapshotItem(0).textContent.trim();

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
            if (GM_getValue('handle.msg.ally').toString() == 'true') {
                log("Message alliance détecté");
                var m = from.match(new RegExp(XtenseRegexps.ally));
                if (m) {
                    var contentNode = Xpath.getSingleNode(document, paths.contents['ally_msg'], messageNode);
                    var message = contentNode.innerHTML.replace(new RegExp(XtenseRegexps.ally_msg_player_name, "g"), "$1");
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
            if (GM_getValue('handle.msg.spy').toString() == 'true') {
                log("Message espionnage détecté");
                var m = subject.match(new RegExp(locales['espionage of'] + XtenseRegexps.planetNameAndCoords));
                if (m) {
                    log('spy detected');

                    var contentNode = Xpath.getSingleNode(document, paths.contents['spy']);
                    var content = contentNode.innerHTML;

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
                    log('The message is not a spy report');
                }
            }

            // Espionnages ennemis
            // TODO : Reporter le parsing msg court ici si possible
            if (GM_getValue('handle.msg.ennemy.spy').toString() == 'true') {
                log("Message espionnage ennemi détecté");
                if (subject.match(new RegExp(locales['espionnage action']))) {
                    var contentNode = Xpath.getSingleNode(document, paths.contents['ennemy_spy']);
                    var rawdata = contentNode.textContent.trim();
                    var m = rawdata.match(new RegExp(XtenseRegexps.messages.ennemy_spy));

                    var rawdata2 = contentNode.innerHTML.trim();
                    var m2 = rawdata2.match(new RegExp(XtenseRegexps.messages.ennemy_spy_moon));

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
            if (GM_getValue('handle.msg.rc').toString() == 'true') {
                var m = subject.match(new RegExp(locales['combat of']));
                if (m != null) {
                    var rapport = Xpath.getStringValue(document, paths.contents['rc']).trim();
                    var m2 = rapport.match(new RegExp(locales['combat defence'] + XtenseRegexps.planetNameAndCoords));
                    if (m2) {
                        log("Traitement du rapport de combat (" + messageId + ") dans les messages");
                        var urlRc = Xpath.getStringValue(document, paths.contents['url_combatreport']).trim();

                        var rcString = XajaxCompo(urlRc);
                        rcString = rcString.replaceAll('<link rel.*/>\n', '').replaceAll('&', '').replaceAll('\n', '').replaceAll('<script.*>.*', '');
                        log(rcString);
                        var docrc = new DOMParser().parseFromString(rcString, 'text/xml');
                        parse_rc(docrc, "");
                    }
                }
            }

            // Recyclages
            if (GM_getValue('handle.msg.rc.cdr').toString() == 'true') {
                log("Message Recyclage détecté");
                if (from.match(new RegExp(locales['fleet'])) && subject.match(new RegExp(locales['harvesting']))) {
                    var m = subject.match(new RegExp(XtenseRegexps.coords));
                    if (m) {
                        var coords = m[1];
                        var contentNode = Xpath.getSingleNode(document, paths.contents['rc_cdr']);
                        var message = Xpath.getStringValue(document, paths.contents['rc_cdr']).trim();
                        var nums = message.getInts();
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
            if (GM_getValue('handle.msg.expeditions').toString() == 'true') {
                log("Message Expédition détecté");
                var m = subject.match(new RegExp(locales['expedition result'] + XtenseRegexps.planetCoords));
                var m2 = from.match(new RegExp(locales['fleet command']));

                if (m2 != null && m != null) {
                    var coords = m[1];
                    var contentNode = Xpath.getSingleNode(document, paths.contents['expedition']);
                    var message = Xpath.getStringValue(document, paths.contents['expedition']).trim();
                    data.type = get_tabid(document);
                    data.coords = coords;
                    data.content = message;
                } else {
                    //log('The message is not an expedition report');
                }
            }

            // Commerce
            if (GM_getValue('handle.msg.commerce').toString() == 'true') {
                log("Message Commerce détecté");
                var m = subject.match(new RegExp(locales['trade message 1']));
                var m2 = subject.match(new RegExp(locales['trade message 2']));

                // Livraison d'un ami sur une de mes plan�tes
                if (m != null) {
                    var message = Xpath.getStringValue(document, paths.contents['livraison']).trim();
                    var infos = message.match(new RegExp(XtenseRegexps.messages.trade_message_infos));

                    var ressourcesLivrees = message.match(new RegExp(XtenseRegexps.messages.trade_message_infos_res_livrees)); // ressources livr�es
                    //log(ressourcesLivrees[1]);
                    var ressources = ressourcesLivrees[1].match(new RegExp(XtenseRegexps.messages.trade_message_infos_res)); // Quantit� de ressources livr�es
                    //log(ressources[1]);
                    //log(ressources[2]);
                    //log(ressources[3]);

                    var met = ressources[1].trimInt();
                    var cri = ressources[2].trimInt();
                    var deut = ressources[3].trimInt();

                    data.type = 'trade';
                    data.trader = infos[1].trim();
                    data.trader_planet = infos[2].trim();
                    data.trader_planet_coords = infos[3].trim();
                    data.planet = infos[4].trim();
                    data.planet_coords = infos[5].trim();
                    data.metal = met;
                    data.cristal = cri;
                    data.deuterium = deut;

                    //log('Livraison du joueur ('+infos[1].trim()+') de la plan�te '+infos[2].trim()+'('+infos[3].trim()+')sur ma plan�te '+infos[4].trim()+'('+infos[5].trim()+') : Metal='+met+' Cristal='+cri+' Deuterium='+deut);

                } else if (m2 != null) { // Livraison sur la plan�te d'un ami
                    var message = Xpath.getStringValue(document, paths.contents['livraison_me']).trim(); // Corps du message

                    var infos = message.match(new RegExp(XtenseRegexps.messages.trade_message_infos_me)); // Infos sur la plan�te
                    var planeteLivraison = infos[4].trim(); // Planete sur laquelle la livraison � eu lieu

                    // R�cup�ration de mes plan�tes
                    var mesPlanetes = Xpath.getOrderedSnapshotNodes(this.win.parent.parent.document, Xpaths.planetData['coords']);
                    var isMyPlanet = false;

                    // Parcours de mes plan�te pour s'assurer que ce n'est pas une des mienne
                    if (mesPlanetes != null && mesPlanetes.snapshotLength > 0) {
                        for (var i = 0; i < mesPlanetes.snapshotLength; i++) {
                            var coord = mesPlanetes.snapshotItem(i).textContent.trim();
                            //log('Coordonnees='+coord+' | planeteLivraison='+planeteLivraison);
                            if (coord.search(planeteLivraison) > -1) {
                                isMyPlanet = true;
                                break;
                            }
                        }
                    }

                    // Livraison sur une plan�te amie ?
                    if (!isMyPlanet) {
                        var ressources = message.match(new RegExp(XtenseRegexps.messages.trade_message_infos_me_res)); // Quantit� de ressources livr�es

                        var met = ressources[1].trimInt();
                        var cri = ressources[2].trimInt();
                        var deut = ressources[3].trimInt();

                        data.type = 'trade_me';
                        data.planet_dest = infos[3].trim();
                        data.planet_dest_coords = planeteLivraison;
                        data.planet = infos[1].trim();
                        data.planet_coords = infos[2].trim();
                        data.trader = 'ME';
                        data.metal = met;
                        data.cristal = cri;
                        data.deuterium = deut;

                        //log('Je livre de ma plan�te '+infos[1].trim()+'('+infos[2].trim()+') sur la plan�te '+infos[3].trim()+'('+infos[4].trim()+') : Metal='+met+' Cristal='+cri+' Deuterium='+deut);
                    }

                }
                /* else {
                 log('The message is not a trade message');
                 }*/

            }

            // Aucun message
            if (data.type == '') {
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
        }
    }
    GM_setValue('lastShtMsgsSize', messagesCourt.snapshotLength); //Pour detection nouveau message
    GM_setValue('lastMsgsSize', messages.snapshotLength); //Pour detection nouveau message
}

/* Page Battle Report */
function parse_rc(doc, minirc) {

    var paths = XtenseXpaths.rc;
    log('Traitement du rapport de combat détaillé');
    var rcStrings = l('combat report');
    var dates = l('dates');
    var data = {};
    var rnds = {};
    var rslt = {};
    // Initilisation des pertes Attaquants et Defenseurs
    rslt['a_lost'] = 0;
    rslt['d_lost'] = 0;

    var date = null;
    var infos = Xpath.getOrderedSnapshotNodes(document, paths.list_infos, null);
    if (infos.snapshotLength > 0) {
        var infosNode = infos.snapshotItem(0);

        date = XtenseParseDate(infosNode.textContent, dates['messagesRC']);
        if (date == null || date == '') {
            date = Math.ceil((new Date().getTime()) / 1000);
        }
        // Recuperation de la chaine json contenant les donnees de l attaque
        var combatRounds = new RegExp(/loadDataBySelectedRound\(({.*}),/);
        var resultCombatRounds = combatRounds.exec(infosNode.innerHTML);

        // Deserialization de la chaine json
        var resultEval = JSON.parse('[' + resultCombatRounds[1] + ']');
        //log(resultEval);
        // Verifie qu'il s'agit bien d'un tableau contenant les infos attaquants et les infos defenseurs
        if (resultEval.length == 2) {
            var nbrounds = Object.keys(resultEval[0]['combatRounds']).length;
            log("Nombre de rounds du RC :" + nbrounds);
            // Verifie qu'il y a au moins 1 round
            if (nbrounds > 0) {
                var playersInfosList = {};
                var roundsInfosList = {};
                var nbMembresAttaquant = Object.keys(resultEval[0]['member']).length;
                var nbMembresDefenseur = Object.keys(resultEval[1]['member']).length;
                var nbJoueurs = nbMembresAttaquant + nbMembresDefenseur;

                // Regroupement des Attaquants et Defenseur dans une meme liste
                // Parcours des membres Attaquants
                for (var i in resultEval[0]['member']) {
                    playersInfosList[i] = resultEval[0]['member'][i];
                    // Ajout du type aux infos joueur
                    playersInfosList[i]['type'] = "A";
                }
                // Parcours des membres Defenseurs
                for (var i in resultEval[1]['member']) {
                    playersInfosList[i] = resultEval[1]['member'][i];
                    // Ajout du type aux infos joueur
                    playersInfosList[i]['type'] = "D";
                }

                for (var rndcpt = 1; rndcpt < nbrounds; rndcpt++) {
                    var rnd = {};

                    // Extraction des statistiques par rounds
                    // TODO : A revoir avec une boucle dans une locale
                    // Nombre de tire de la flotte attaquante
                    var nbShootAtt = resultEval[0]['combatRounds'][rndcpt]['statistic']['hits'];
                    if (nbShootAtt)
                        rnd['a_nb'] = nbShootAtt;
                    // Force totale de la flotte attaquante
                    var fullStrengthAtt = resultEval[0]['combatRounds'][rndcpt]['statistic']['fullStrength'];
                    if (fullStrengthAtt)
                        rnd['a_shoot'] = fullStrengthAtt;
                    // Absorption des boucliers de la flotte defensive
                    var absorbedDamageDef = resultEval[1]['combatRounds'][rndcpt]['statistic']['absorbedDamage'];
                    if (absorbedDamageDef)
                        rnd['d_bcl'] = absorbedDamageDef;
                    // Nombre de tire de la flotte defensive
                    var nbShootDef = resultEval[1]['combatRounds'][rndcpt]['statistic']['hits'];
                    if (nbShootDef)
                        rnd['d_nb'] = nbShootDef;
                    // Force totale de la flotte defensive
                    fullStrengthAtt = resultEval[1]['combatRounds'][rndcpt]['statistic']['fullStrength'];
                    if (fullStrengthAtt)
                        rnd['d_shoot'] = fullStrengthAtt;
                    // Absorption des boucliers de la flotte attaquante
                    absorbedDamageDef = resultEval[0]['combatRounds'][rndcpt]['statistic']['absorbedDamage'];
                    if (absorbedDamageDef)
                        rnd['a_bcl'] = absorbedDamageDef;

                    rnds[rndcpt] = rnd;
                }

                var compteurData = 0;
                for (rndcpt = 0; rndcpt < nbrounds; rndcpt++) {
                    // Boucle dans la liste des joueurs participants
                    for (var idPlayer in playersInfosList) {
                        var playerFleet = {};
                        var playerTechnos = {};
                        var nbVaisseauxRestant = 0;
                        var playerType = playersInfosList[idPlayer]['type']; // Attaquant A ou Defenseur D
                        var indexTypePlayer = playerType == 'A' ? 0 : 1;

                        // Les types de vaisseaux presents
                        var types = resultEval[indexTypePlayer]['combatRounds'][rndcpt]['ships'][idPlayer];

                        var nbTypesVaisseaux = Object.keys(types).length;
                        //log("Type des Unites=" + nbTypeVaisseau);
                        if (nbTypesVaisseaux > 0) {
                            for (var type in types) {
                                for (var i in rcStrings['units']) {
                                    for (var j in rcStrings['units'][i]) {
                                        var typ = (type == j);
                                        if (typ) {
                                            playerFleet[XtenseDatabase[i][j]] = types[type];
                                            nbVaisseauxRestant += types[type];
                                            //log("Type unite=" + i + " - " + j + " - data=" + playerFleet[database[i][j]]);
                                        }
                                    }
                                }
                            }
                        }

                        // Increment des pertes Attaquant et Defenseur
                        var loosesFleetOrDef = resultEval[indexTypePlayer]['combatRounds'][rndcpt]['lossesInThisRound'];
                        var loosesCost = 0;
                        if (loosesFleetOrDef != null) {
                            for (var idFltOrDef in loosesFleetOrDef[idPlayer]) {
                                loosesCost += parseInt(loosesFleetOrDef[idPlayer][idFltOrDef]) * parseInt(rcStrings['unitsCost'][idFltOrDef]);
                            }
                        }
                        if (playerType == 'A') {
                            rslt['a_lost'] += loosesCost;
                        }
                        else {
                            rslt['d_lost'] += loosesCost;
                        }

                        // Joueur detruit ?
                        var dest = (nbVaisseauxRestant == 0) ? 1 : 0;
                        if (dest && playerType == 'A') {
                            nbMembresAttaquant--;
                        } else if (dest && playerType == 'D') {
                            nbMembresDefenseur--;
                        }

                        // Nom joueur et coordonnees
                        var playerName = resultEval[indexTypePlayer]['member'][idPlayer]['ownerName']; //Joueur non detruit
                        var playerCoords = resultEval[indexTypePlayer]['member'][idPlayer]['ownerCoordinates'];

                        //Technos
                        var playerInfos = resultEval[indexTypePlayer]['member'][idPlayer];
                        for (var i in rcStrings['regxps']['weapons']) {
                            var playerTechno = playerInfos[rcStrings['regxps']['weapons'][i]];
                            if (playerTechno) {
                                playerTechnos[i] = playerTechno;
                            }
                        }

                        data[compteurData] = {
                            player: playerName,
                            coords: playerCoords,
                            type: playerType,
                            weapons: playerTechnos,
                            content: playerFleet
                        };
                        compteurData++;
                    }
                }
            }
        }

        // Pillages
        var win_resources = Xpath.getOrderedSnapshotNodes(document, paths.win_resource);
        for (var cpt = 0; cpt < win_resources.snapshotLength; cpt++) {
            for (var i in rcStrings['regxps']['result']['win']) {
                if (win_resources.snapshotItem(cpt).innerHTML.match(new RegExp(rcStrings['regxps']['result']['win'][i]))) {
                    cpt++;
                    rslt[i] = win_resources.snapshotItem(cpt).title.replace(/\./g, '');
                    break;
                }
            }
        }

        // Champ de Debris
        var deb_resource = Xpath.getOrderedSnapshotNodes(document, paths.deb_resource);
        for (var cpt = 0; cpt < deb_resource.snapshotLength; cpt++) {
            for (var i in rcStrings['regxps']['result']['deb']) {
                if (deb_resource.snapshotItem(cpt).innerHTML.match(new RegExp(rcStrings['regxps']['result']['deb'][i]))) {
                    cpt++;
                    rslt[i] = deb_resource.snapshotItem(cpt).title.replace(/\./g, '');
                    break;
                }
            }
        }

        if (nbMembresAttaquant == 0)
            var win = "D";
        else if (nbMembresDefenseur == 0)
            var win = "A";
        else
            var win = "N";

        var moonprob = 0;
        if (minirc != null && minirc != '') {
            // Recupere la probabilite de formation d'une lune
            var moonprobmatch = minirc.match(new RegExp(rcStrings['regxps']['moonprob']));
            if (moonprobmatch != null && moonprobmatch.length > 1) {
                moonprob = moonprobmatch[1];
            }

            // Recupere la formation d'une lune
            var moon = 0;
            var moonNodes = Xpath.getOrderedSnapshotNodes(document, paths.moon);
            if (moonNodes.snapshotLength > 0 && moonNodes.snapshotItem(0).textContent.match(new RegExp(rcStrings['regxps']['moon']))) {
                moon = 1;
            }
        }
        // Ogame API
        var ogameAPITitle = Xpath.getOrderedSnapshotNodes(doc, XtenseXpaths.messages.ogameapi, infosNode).snapshotItem(0).value;
        var regexApi = new RegExp(XtenseRegexps.ogameapi);
        var ogameAPILink = regexApi.exec(ogameAPITitle)[1];

        //Texte entier du raid, brut

        /*var rounds = Xpath.getOrderedSnapshotNodes(doc, paths.combat_round);
         var round = -1;
         log('Nb Rounds' + rounds.snapshotLength);
         if (rounds.snapshotLength > 0) {
         round = rounds.snapshotItem(0).textContent.trim();
         }*/
        var type = get_tabid(doc);


        XtenseRequest.set({
            type: type,
            date: date,
            win: win,
            count: nbrounds,
            result: rslt,
            moon: moon,
            moonprob: moonprob,
            rounds: rnds,
            n: data,
            rawdata: resultEval,
            ogapilnk: ogameAPILink
        });
        XtenseRequest.send();
    }
}


/* Fonction de parsing d'un RE */

function parse_spy_report(RE) {
    setStatus(XLOG_NORMAL, Xl('re_detected'));
    var paths = XtenseXpaths.messages.spy;
    var spyStrings = l('spy reports');
    var locales = l('messages');

    var infos = Xpath.getOrderedSnapshotNodes(document, paths.list_infos, null);
    if (infos.snapshotLength > 0) {
        var infosNode = infos.snapshotItem(0);
    }

    var data = {};
    var typs = [];
    var res = [];

    var attackRef = Xpath.getStringValue(document, paths.moon);
    var isMoon = attackRef.search('type=3') > -1;
    var playerName = Xpath.getSingleNode(document, paths.playername).textContent.trim();
    var types = Xpath.getOrderedSnapshotNodes(document, paths.materialfleetdefbuildings);
    for (var i in spyStrings['units']) {
        for (var k = 0; k < types.snapshotLength; k++) {
            if (types.snapshotItem(k).textContent.trim().match(new RegExp(spyStrings['groups'][i], 'gi'))) {
                //log("Groupe Trouvé = " + types.snapshotItem(k).textContent.trim());
                if (k++ < types.snapshotLength) {
                    for (var z = k; z < types.snapshotLength; z++) {
                        var finish = false;
                        for (var units in spyStrings['units']) {
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

                        if (types.snapshotItem(z).title != null && types.snapshotItem(z).title.trim() != '') {
                            for (var j in spyStrings['units'][i]) {
                                if (types.snapshotItem(z).innerHTML.match(new RegExp(spyStrings['units'][i][j], 'gi'))) {
                                    data[XtenseDatabase[i][j]] = types.snapshotItem(z).title.trim().replace(/\./g, '');
                                    //log("R="+XtenseDatabase.database[i][j] + " = " + data[XnewOgame.database[i][j]]);
                                }
                            }
                        } else {
                            for (var j in spyStrings['units'][i]) {
                                var m = getElementInSpyReport(types.snapshotItem(z).textContent.trim(), spyStrings['units'][i][j]);

                                if (m > -1) {
                                    data[XtenseDatabase[i][j]] = m;
                                    //log("BT="+spyStrings['units'][i][j] + " = " + data[XnewOgame.database[i][j]]);
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
    var ogameAPITitle = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.messages.ogameapi, infosNode).snapshotItem(0).value;
    var regexApi = new RegExp(XtenseRegexps.ogameapi);
    var ogameAPILink = regexApi.exec(ogameAPITitle)[1];

    return {
        content: data,
        playerName: playerName,
        moon: isMoon,
        ogapilnk: ogameAPILink
    };
}

/* Fonction de récupération de données dans un RE */

function getElementInSpyReport(RE, elem) {
    var num = -1;
    var reg = new RegExp(elem + '\\D+(\\d[\\d.]*)'); // (\D+)(.\d*(\,|\.)\d*\w{1})
    //recupere le nombre le plus proche apres le texte
    var m = reg.exec(RE);
    //log(RE);
    if (m)
        num = m[1].trimInt();
    //log(elem + " : " + num);
    return num;
}