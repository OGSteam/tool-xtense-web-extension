/**
 * Created by Anthony on 13/12/2015.
 */

function handle_current_page() {
    // Expressions régulières des pages
    var regGalaxy = new RegExp(/(galaxy)/);
    var regOverview = new RegExp(/(overview)/);
    var regOption = new RegExp(/(xtense=Options)/);
    var regResearch = new RegExp(/(research)/);
    var regBuildings = new RegExp(/(resources)/);
    var regStation = new RegExp(/(station)/);
    var regShipyard = new RegExp(/(shipyard)/);
    var regFleet1 = new RegExp(/(fleet1)/);
    var regDefense = new RegExp(/(defense)/);
    var regMessages = new RegExp(/(messages)/);
    var regAlliance = new RegExp(/(alliance)/);
    var regStats = new RegExp(/(highscore)/);
    if (regOption.test(url)) {
        displayOptions();
    } else if (regGalaxy.test(url)) {
        if (GM_getValue('handle.system', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            GM_setValue('lastAction', '');
            get_galaxycontent();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regOverview.test(url)) {
        save_my_planets_coords();
        if (GM_getValue('handle.overview', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            get_planet_details();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regResearch.test(url)) {
        if (GM_getValue('handle.researchs', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            parse_researchs();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regBuildings.test(url)) {
        if (GM_getValue('handle.buildings', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            parse_buildings();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regStation.test(url)) {
        if (GM_getValue('handle.station', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            parse_station();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regShipyard.test(url) || regFleet1.test(url)) {
        if (GM_getValue('handle.shipyard', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            parse_shipyard();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regDefense.test(url)) {
        if (GM_getValue('handle.defense', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            parse_defense();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regMessages.test(url)) {
        if (GM_getValue('handle.msg.msg', 'false').toString() == 'true' ||
            GM_getValue('handle.msg.ally', 'false').toString() == 'true' ||
            GM_getValue('handle.msg.spy', 'false').toString() == 'true' ||
            GM_getValue('handle.msg.ennemy.spy', 'false').toString() == 'true' ||
            GM_getValue('handle.msg.rc.cdr', 'false').toString() == 'true' ||
            GM_getValue('handle.msg.expeditions', 'false').toString() == 'true' ||
            GM_getValue('handle.msg.commerce', 'false').toString() == 'true'
        ) {
            get_message_content();
        }
    } else if (regAlliance.test(url)) {
        if (GM_getValue('handle.alliance', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            GM_setValue('lastAction', '');
            parse_ally_inserted();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regStats.test(url)) {
        if (GM_getValue('handle.stats', 'false').toString() == 'true' || GM_getValue('manual.send', 'false').toString() == 'true') {
            GM_setValue('lastAction', '');
            get_ranking_content();
            GM_setValue('manual.send', 'false');
        } else {
            manual_send();
        }
    } else {
        setStatus(XLOG_NORMAL, Xl('unknow_page'));
    }
}

/* Fonction d'envoi manuel */

function manual_send() {
    GM_setValue('manual.send', 'true');
    displayXtense();
    setStatus(XLOG_SEND, Xl('wait_send'));
}

/************************ Declenchement des Parsings sur Remplissage Ajax ************************/
/* Fonction ajoutant lancant le parsing de la vue galaxie quand celle-ci est chargée */

function get_galaxycontent() {

    $("#galaxyContent").on("DOMNodeInserted", parse_galaxy_system_inserted);

}
/* Fonction ajoutant lancant le parsing de la vue alliance quand celle-ci est chargée */

function get_ally_content() {

    $("#inhalt").on("DOMNodeInserted", parse_ally_inserted);
}
/* Fonction ajoutant lancant le parsing de la vue classement quand celle-ci est chargée */

function get_ranking_content() {

    $("#stat_list_content").on("DOMNodeInserted", parse_ranking_inserted);
}
/* Fonction ajoutant lancant le parsing de la vue classement quand celle-ci est chargée */

function get_message_content() {

    $("#buttonz").on("DOMNodeInserted", parse_messages);
}
/* Fonction ajoutant lancant le parsing de la vue générale quand celle-ci est chargée */

function get_planet_details() {
    setStatus(XLOG_NORMAL, Xl('overview_detected'));
    parse_overview();
}

/************************ PARSING DES PAGES  ***************************/
/* Fonction appelée lors d'évenement sur le chargement du contenu galaxie */

function parse_galaxy_system_inserted(event) {
    log('In parse_galaxy_system_inserted()');
    //var doc = event.target.ownerDocument;
    var paths = XtenseXpaths.galaxy;
    //Référence Xpaths
    var galaxy = Xpath.getSingleNode(document, paths.galaxy_input).value.trim();
    //Récupération Galaxie
    var system = Xpath.getSingleNode(document, paths.system_input).value.trim();
    //Récupération SS
    var rows = Xpath.getUnorderedSnapshotNodes(document, paths.rows);
    //log("lastAction : "+GM_getValue(prefix_GMData +'lastAction',''));
    if (GM_getValue('lastAction', '') != 's:' + galaxy + ':' + system) {
        var coords = [
            galaxy,
            system
        ];
        if (isNaN(coords[0]) || isNaN(coords[1])) {
            log('invalid system' + ' ' + coords[0] + ' ' + coords[1]);
            return;
        }
        setStatus(XLOG_NORMAL, Xl('system_detected', coords[0], coords[1]));
        if (rows.snapshotLength > 0) {
            //var XtenseRequest = new XtenseRequest(null, null, null);
            log(rows.snapshotLength + ' rows found in galaxy');
            var rowsData = [];
            for (var i = 0; i < rows.snapshotLength; i++) {
                var row = rows.snapshotItem(i);
                var name = Xpath.getStringValue(document, paths.planetname, row).trim().replace(/\($/, '');
                var name_l = Xpath.getStringValue(document, paths.planetname_1, row).trim().replace(/\($/, '');
                var name_tooltip = Xpath.getStringValue(document, paths.planetname_tooltip, row).trim().replace(/\($/, '');
                var player = Xpath.getStringValue(document, paths.playername, row).trim();
                var player2 = Xpath.getStringValue(document, paths.playername2, row).trim();
                var player_tooltip = Xpath.getStringValue(document, paths.playername_tooltip, row).trim();
                if (player_tooltip == '') {
                    if (player == '') {
                        if (player2 == '') {
                            log('row ' + (i + 1) + ' has no player name');
                            continue;
                        } else
                            player = player2;
                    }
                } else
                    player = player_tooltip;
                if (name_tooltip == '') {
                    if (name == '') {
                        if (name_l == '') {
                            log('row ' + (i + 1) + ' has no planet name');
                            continue;
                        } else
                            name = name_l;
                    }
                } else
                    name = name_tooltip;
                //var position = i+1;
                var position = Xpath.getNumberValue(document, paths.position, row);
                if (isNaN(position)) {
                    log('position ' + position + ' is not a number');
                    continue;
                }
                var moon = Xpath.getUnorderedSnapshotNodes(document, paths.moon, row);
                moon = moon.snapshotLength > 0 ? 1 : 0;
                var statusNodes = Xpath.getUnorderedSnapshotNodes(document, paths.status, row);
                var status = '';
                if (statusNodes.snapshotLength > 0) {
                    for (var j = 0; j < statusNodes.snapshotLength; j++) {
                        status += statusNodes.snapshotItem(j).textContent.trimAll();
                    }
                } else {
                    status = '';
                }
                var banned = Xpath.getStringValue(document, paths.status_baned, row).trim();
                status = banned + status;
                var activity = Xpath.getStringValue(document, paths.activity, row).trim();
                if (!activity) {
                    activity = (Xpath.getStringValue(document, paths.activity15, row) ? 0 : -1);
                    //If contains 'minutes15' in class
                }
                var activityMoon = Xpath.getStringValue(document, paths.activity_m, row).trim();
                if (!activityMoon) {
                    activityMoon = (Xpath.getStringValue(document, paths.activity15_m, row) ? 0 : -1);
                    //If contains 'minutes15' in class
                }
                var allytag = Xpath.getStringValue(document, paths.allytag, row).trim();
                var debris = [];
                for (var j = 0; j < 2; j++) {
                    debris[XtenseDatabase['resources'][601 + j]] = 0;
                }
                var debrisCells = Xpath.getUnorderedSnapshotNodes(document, paths.debris, row);
                for (var j = 0; j < debrisCells.snapshotLength; j++) {
                    debris[XtenseDatabase['resources'][601 + j]] = debrisCells.snapshotItem(j).innerHTML.trimInt();
                }
                var player_id = Xpath.getStringValue(document, paths.player_id, row).trim();
                if (player_id != '') {
                    player_id = player_id.trimInt();
                    //} else if(doc.cookie.match(/login_(.*)=U_/)){
                } else if (player) {
                    //player_id = doc.cookie.match(/login_(.*)=U_/)[1];
                    player_id = XtenseMetas.getPlayerId();
                }
                var allyid = Xpath.getStringValue(document, paths.ally_id, row).trim();
                if (allyid != '') {
                    allyid = allyid.trimInt();
                    log('Ally id' + allyid);
                } else {
                    allyid = '0';
                }
                var planet_id = Xpath.getStringValue(document, paths.planet_id, row).trim();
                var moon_id = Xpath.getStringValue(document, paths.moon_id, row).trim();
                log('row ' + position + ' > player_id:' + player_id + ',planet_name:' + name + ',planet_id:' + planet_id + ',moon_id:' + moon_id + ',moon:' + moon + ',player_name:' + player + ',status:' + status + ',ally_id:' + allyid + ',ally_tag:' + allytag + ',debris:(' + debris[XtenseDatabase['resources'][601]] + '/' + debris[XtenseDatabase['resources'][602]] + '),activity:' + activity + ',activity_moon:' + activityMoon);
                var r = {
                    player_id: player_id,
                    planet_name: name,
                    planet_id: planet_id,
                    moon_id: moon_id,
                    moon: moon,
                    player_name: player,
                    status: status,
                    ally_id: allyid,
                    ally_tag: allytag,
                    debris: debris,
                    activity: activity,
                    activityMoon: activityMoon
                };
                rowsData[position] = r;
            }
            XtenseRequest.set({
                row: rowsData,
                galaxy: coords[0],
                system: coords[1],
                type: 'system'
            });
            XtenseRequest.set('lang', langUnivers);
            XtenseRequest.send();
            GM_setValue('lastAction', 's:' + coords[0] + ':' + coords[1]);
        }
    }
}
/* Fonction appelée lors d'évenement sur le chargement de la page d'alliance */

function parse_ally_inserted() {
    //log("last_action="+GM_getValue(prefix_GMData +'lastAction',''));
    if (GM_getValue('lastAction', '') != 'ally_list') {
        setStatus(XLOG_NORMAL, Xl('ally_list_detected'));
        var paths = XtenseXpaths.ally_members_list;
        var rows = Xpath.getOrderedSnapshotNodes(document, paths.rows);
        var rowsData = [];
        log(rows.snapshotLength + ' membres à envoyer !');
        for (var i = 0; i < rows.snapshotLength; i++) {
            var row = rows.snapshotItem(i);
            var player = Xpath.getStringValue(document, paths.player, row).trim();
            var points = Xpath.getStringValue(document, paths.points, row).trimInt();
            var rank = Xpath.getStringValue(document, paths.rank, row).trimInt();
            var coords = Xpath.getStringValue(document, paths.coords, row).trim();
            coords = coords.match(new RegExp(XtenseRegexps.coords))[1];
            var r = {
                player: player,
                points: points,
                coords: coords,
                rank: rank
            };
            rowsData[i] = r;
        }
        if (rowsData.length > 0) {
            var tag = Xpath.getStringValue(document, paths.tag);
            XtenseRequest.set({
                n: rowsData,
                type: 'ally_list',
                tag: tag
            });
            XtenseRequest.set('lang', langUnivers);
            XtenseRequest.send();
            GM_setValue('lastAction', 'ally_list')
        }
        get_ally_content();
    }
}
/* Fonction appelée lors d'évenement sur le chargement des classements */

function parse_ranking_inserted(event) {
    log('Entering parse_ranking_inserted');
    var paths = XtenseXpaths.ranking;
    var rows = Xpath.getOrderedSnapshotNodes(document, paths.rows, null);
    if (rows.snapshotLength > 0) {
        //Récupération de la date courante du jeu
        var timeText = Xpath.getStringValue(document, paths.time).trim();
        timeText = timeText.match(/(\d+).(\d+).(\d+)[^\d]+(\d+):\d+:\d+/);
        //Conversion dans la plage de 8 (0-8-16)
        var time = new Date();
        time.setHours((Math.floor(time.getHours()) / 8) * 8);
        time.setMinutes(0);
        time.setSeconds(0);
        if (timeText) {
            time.setYear(timeText[3]);
            time.setMonth(parseInt(timeText[2].trimZeros()) - 1);
            time.setDate(timeText[1]);
            time.setHours(Math.floor(parseInt(timeText[4].trimZeros()) / 8) * 8);
        }
        time = Math.floor(time.getTime() / 1000);
        //Détermination du type de classement
        var type = [];
        type[0] = Xpath.getStringValue(document, paths.who);
        type[1] = Xpath.getStringValue(document, paths.type);
        type[2] = Xpath.getStringValue(document, paths.subnav_fleet);
        type[0] = (type[0] != '') ? type[0] : 'player';
        type[0] = (type[0] == 'alliance') ? 'ally' : type[0];
        type[1] = (type[1] != '') ? type[1] : 'points';
        var length = 0;
        //var rows = Xpath.getOrderedSnapshotNodes(document,paths.rows,null);
        var offset = 0;
        log('time:' + time + ',type1:' + type[0] + ',type2:' + type[1] + ',type3: ' + type[2] + ',nombreLignes:' + rows.snapshotLength);
        //if(rows.snapshotLength > 0){ //Double sécurité
        var rowsData = [];
        for (var i = 0; i < rows.snapshotLength; i++) {
            var row = rows.snapshotItem(i);
            var n = Xpath.getStringValue(document, paths.position, row).trimInt();
            if (i == 1) {
                offset = Math.floor(n / 100) * 100 + 1;
                //parce que le nouveau classement ne commence pas toujours pile a la centaine et OGSpy toujours a 101,201...
            }
            var ally = Xpath.getStringValue(document, paths.allytag, row).trim().replace(/\]|\[/g, '');
            var ally_id = Xpath.getStringValue(document, paths.ally_id, row).trim();
            if (ally_id != '' && !ally_id.match(/page\=alliance/)) {
                //Pas d'id sur le lien de sa propre alliance (dans les classements alliances)
                ally_id = ally_id.match(/allianceId\=(.*)/);
                ally_id = ally_id[1];
            } else if (ally) {
                ally_id = XtenseMetas.getAllyId();
            }
            var points = Xpath.getStringValue(document, paths.points, row).trimInt();
            if (type[0] == 'player') {
                var name = Xpath.getStringValue(document, paths.player.playername, row).trim();
                var player_id = Xpath.getStringValue(document, paths.player.player_id, row).trim();
                if (player_id != '') {
                    player_id = player_id.match(/\&to\=(.*)\&ajax/);
                    player_id = player_id[1];
                } else if (document.cookie.match(/login_(.*)=U_/))
                    player_id = document.cookie.match(/login_(.*)=U_/)[1];
                /*Nombre de vaisseaux*/
                if (type[1] == 'fleet') {
                    var NbVaisseaux = Xpath.getStringValue(document, paths.nb_vaisseaux, row).trimInt();
                    log('row ' + n + ' > player_id:' + player_id + ',player_name:' + name + ',ally_id:' + ally_id + ',ally_tag:' + ally + ',points:' + points + ',NbVaisseaux:' + NbVaisseaux);
                    var r = {
                        player_id: player_id,
                        player_name: name,
                        ally_id: ally_id,
                        ally_tag: ally,
                        points: points,
                        nb_spacecraft: NbVaisseaux
                    };
                } else {
                    log('row ' + n + ' > player_id:' + player_id + ',player_name:' + name + ',ally_id:' + ally_id + ',ally_tag:' + ally + ',points:' + points);
                    var r = {
                        player_id: player_id,
                        player_name: name,
                        ally_id: ally_id,
                        ally_tag: ally,
                        points: points
                    };
                }
            } else if (type[0] == 'ally') {
                var members = Xpath.getStringValue(document, paths.ally.members, row).trim().getInts();
                var moy = Xpath.getStringValue(document, paths.ally.points_moy, row).replace('|.', '').trimInt();
                log('row ' + n + ' > ally_id:' + ally_id + ',ally_tag:' + ally + ',members:' + members + ',points:' + points + ',mean:' + moy);
                var r = {
                    ally_id: ally_id,
                    ally_tag: ally,
                    members: members,
                    points: points,
                    mean: moy
                };
            }
            rowsData[n] = r;
            length++;
        }

        if (GM_getValue('lastAction', '') != 'r:' + type[0] + ':' + type[1] + ':' + offset) { //TODO Eviter de parser les classements pour rien...
            setStatus(XLOG_NORMAL, Xl('ranking_detected'));
            GM_setValue('lastAction', 'r:' + type[0] + ':' + type[1] + ':' + offset);
            if (offset != 0 && length != 0) {
                XtenseRequest.set({
                    n: rowsData,
                    type: 'ranking',
                    offset: offset,
                    type1: type[0],
                    type2: type[1],
                    type3: type[2],
                    time: time
                });
                XtenseRequest.set('lang', langUnivers);
                XtenseRequest.send();
            }
        }
    }
}
//Fin Fonction
/* Page Overview */

function parse_overview(event) {
    if (typeof (delaytodisplay_overview) != 'undefined') {
        clearInterval(delaytodisplay_overview);
    }
    //Supression du setinterval si il existe

    var temperatures = Xpath.getStringValue(document, XtenseXpaths.overview.temperatures);
    if ((temperatures != null) && (temperatures != '')) {
        var planetData = getPlanetData();
        if (GM_getValue('lastAction', '') != 'planet_name:' + planetData.planet_name) {
            var cases = Xpath.getStringValue(document, XtenseXpaths.overview.cases).trimInt();
            var temperature_max = temperatures.match(/\d+[^\d-]*(-?\d+)[^\d]/)[1];
            var temperature_min = temperatures.match(/(-?\d+)/)[1];
            var resources = getResources();
            var ogame_time = XtenseMetas.getTimestamp();
            // retreive boosters and extensions
            var planetBoostersAndExtensions = getPlanetBoostersAndExtensions();

            XtenseRequest.set({
                type: 'overview',
                fields: cases,
                temperature_min: temperature_min,
                temperature_max: temperature_max,
                ressources: resources,
                ogame_timestamp: ogame_time
            }, planetData, planetBoostersAndExtensions);
            XtenseRequest.set('lang', langUnivers);
            XtenseRequest.send();
            GM_setValue('lastAction', 'planet_name:' + planetData.planet_name);
        }
    } else {
        log('Temperature Content is not there! Retrying...');
        delaytodisplay_overview = setInterval(get_planet_details, 50);
        // Necessaire car la page est remplie par des scripts JS. (Au premier passage les balises contenant les infomations sont vides)
    }
}
/* Page Buildings */

function parse_buildings() {
    setStatus(XLOG_NORMAL, Xl('buildings_detected'));
    var paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'buildings');
    var levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    var tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (var lvl = 0; lvl < levels.snapshotLength; lvl++) {
            var level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
            if (level != '') {
                tabLevel.push(level);
            }
        }
    }
    XtenseRequest.set(getPlanetData());
    XtenseRequest.set({
        'M': tabLevel[0],
        'C': tabLevel[1],
        'D': tabLevel[2],
        'CES': tabLevel[3],
        'CEF': tabLevel[4],
        'SAT': tabLevel[5],
        'HM': tabLevel[6],
        'HC': tabLevel[7],
        'HD': tabLevel[8]
    });
    XtenseRequest.send();
}
/* Page Stations */

function parse_station() {
    setStatus(XLOG_NORMAL, Xl('installations_detected'));
    var paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'buildings');
    var levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    var tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (var lvl = 0; lvl < levels.snapshotLength; lvl++) {
            var level = levels.snapshotItem(lvl).nodeValue.trim();
            if (level != '') {
                tabLevel.push(level);
            }
        }
    }
    var send;
    XtenseRequest.set(getPlanetData());
    if (!isMoon()) {
        send = {
            'UdR': tabLevel[0],
            'CSp': tabLevel[1],
            'Lab': tabLevel[2],
            'DdR': tabLevel[3],
            'Silo': tabLevel[4],
            'UdN': tabLevel[5],
            'Ter': tabLevel[6]
        };
    } else {
        send = {
            'UdR': tabLevel[0],
            'CSp': tabLevel[1],
            'BaLu': tabLevel[2],
            'Pha': tabLevel[3],
            'PoSa': tabLevel[4]
        };
    }
    XtenseRequest.set(send);
    XtenseRequest.send();
}
/* Page Researchs */

function parse_researchs() {
    setStatus(XLOG_NORMAL, Xl('researchs_detected'));
    XtenseRequest.set('type', 'researchs');
    var levels = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.levels.level, null);
    var tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (var lvl = 0; lvl < levels.snapshotLength; lvl++) {
            var level = levels.snapshotItem(lvl).nodeValue.trim();
            if (level != '') {
                tabLevel.push(level);
            }
        }
    }
    XtenseRequest.set(getPlanetData());
    XtenseRequest.set({
        'NRJ': tabLevel[0],
        'Laser': tabLevel[1],
        'Ions': tabLevel[2],
        'Hyp': tabLevel[3],
        'Plasma': tabLevel[4],
        'RC': tabLevel[5],
        'RI': tabLevel[6],
        'PH': tabLevel[7],
        'Esp': tabLevel[8],
        'Ordi': tabLevel[9],
        'Astrophysique': tabLevel[10],
        'RRI': tabLevel[11],
        'Graviton': tabLevel[12],
        'Armes': tabLevel[13],
        'Bouclier': tabLevel[14],
        'Protection': tabLevel[15]
    });
    XtenseRequest.send();
    //setStatus(XLOG_SUCCESS,Xl('success_research'));
}
/* Page Shipyard */

function parse_shipyard() {
    setStatus(XLOG_NORMAL, Xl('fleet_detected'));
    var paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'fleet');
    var levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    var tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (var lvl = 0; lvl < levels.snapshotLength; lvl++) {
            var level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
            if (level != '') {
                tabLevel.push(level);
            }
        }
    }
    var req = '';
    req = {
        'CLE': tabLevel[0],
        'CLO': tabLevel[1],
        'CR': tabLevel[2],
        'VB': tabLevel[3],
        'TRA': tabLevel[4],
        'BMD': tabLevel[5],
        'DST': tabLevel[6],
        'EDLM': tabLevel[7],
        'PT': tabLevel[8],
        'GT': tabLevel[9],
        'VC': tabLevel[10],
        'REC': tabLevel[11],
        'SE': tabLevel[12]
    };
    XtenseRequest.set(getPlanetData());
    XtenseRequest.set(req);
    XtenseRequest.send();
}
/* Page Defense */

function parse_defense() {
    setStatus(XLOG_NORMAL, Xl('defense_detected'));
    var paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'defense');
    var levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    var tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (var lvl = 0; lvl < levels.snapshotLength; lvl++) {
            var level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
            if (level != '') {
                tabLevel.push(level);
            }
        }
    }
    XtenseRequest.set(getPlanetData());
    XtenseRequest.set({
        'LM': tabLevel[0],
        'LLE': tabLevel[1],
        'LLO': tabLevel[2],
        'CG': tabLevel[3],
        'AI': tabLevel[4],
        'LP': tabLevel[5],
        'PB': tabLevel[6],
        'GB': tabLevel[7],
        'MIC': tabLevel[8],
        'MIP': tabLevel[9]
    });
    XtenseRequest.send();
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
        var ogameAPILink = '';
        var actionsLinksNodes = Xpath.getOrderedSnapshotNodes(document, paths.actions_links);
        for (var cpt = 0; cpt < actionsLinksNodes.snapshotLength; cpt++) {
            if (actionsLinksNodes.snapshotItem(cpt).href != null && actionsLinksNodes.snapshotItem(cpt).href.match(new RegExp(rcStrings['regxps']['ogameAPI_link']))) {
                ogameAPILink = actionsLinksNodes.snapshotItem(cpt).href;
                break;

            }
        }
        //Texte entier du raid, brut

        /*var rounds = Xpath.getOrderedSnapshotNodes(doc, paths.combat_round);
         var round = -1;
         log('Nb Rounds' + rounds.snapshotLength);
         if (rounds.snapshotLength > 0) {
         round = rounds.snapshotItem(0).textContent.trim();
         }*/
        XtenseRequest.set({
            type: 'rc',
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
/* Page Messages */

function parse_messages() {
    setStatus(XLOG_NORMAL, Xl('messages_detected'));
    var paths = XtenseXpaths.messages;
    var data = {};

    //GM_getValue('last_message')

    var messages = Xpath.getOrderedSnapshotNodes(document, paths.showmessage, null);
    var messagesCourt = Xpath.getOrderedSnapshotNodes(document, paths.shortmessages, null);

    // Traitement des listes de messages court (declenche lorsque l'on change d'onglet ou de page)
    if (messagesCourt.snapshotLength > 0 && messagesCourt.snapshotLength != this.lastShtMsgsSize && messages.snapshotLength == this.lastMsgsSize) {
        if ((GM_getValue("last_shortmessage", 0).toString()) != messagesCourt.snapshotLength) {
            GM_setValue("last_shortmessage", messagesCourt.snapshotLength);
            var locales = l('messages');

            // Parcours de la liste de messages court
            // TODO : Ne pas re-parcourir les messages court deja parse
            for (var cptShtMsg = 0; cptShtMsg < messagesCourt.snapshotLength; cptShtMsg++) {
                var shortMessageNode = messagesCourt.snapshotItem(cptShtMsg);
                var msgContent = shortMessageNode.textContent.trim();
                // Recupere l'id du message court
                var idmsg = shortMessageNode.attributes['data-msg-id'].value;
                log("ID Message court : " + idmsg);
                /*var api = Xpath.getStringValue(document, paths.ogameapi, messagesCourt).trim();
                 if (api) {
                 log("API : " + api);
                 }*/
                /* Cache des messages */
                 if (messagesIdCache == null || messagesIdCache == 'undefined') {
                 // Initialisation du cache d'identifiant de message
                 var messagesIdCache = Array();
                 }

                // Verifie que le message court n'a pas deja ete traite
                 if (messagesIdCache.indexOf(idmsg) == -1) {
                 messagesIdCache.push(idmsg);
                 }

                // Espionnage ennemi
                if ((GM_getValue('handle.msg.ennemy.spy').toString() == 'true') && msgContent.match(new RegExp(locales['espionnage action']))) {

                    log("Message court Espionnage Ennemi détecté : ");
                    var fromToInfo = msgContent.match(new RegExp(XtenseRegexps.messages.ennemy_spy));

                    if (fromToInfo) {
                        var data = {};

                        data.type = 'ennemy_spy';
                        data.from = fromToInfo[1];
                        data.to = fromToInfo[2];

                        var msgInnerHTML = shortMessageNode.innerHTML.trim();
                        var fromToMoons = msgInnerHTML.match(new RegExp(XtenseRegexps.messages.ennemy_spy_moon));
                        if (fromToMoons) {
                            data.toMoon = 0;
                            if (fromToMoons[2] == 'Lune') {
                                data.toMoon = 1;
                            }
                            data.fromMoon = 0;
                            if (fromToMoons[1] == 'Lune') {
                                data.fromMoon = 1;
                            }
                            data.proba = fromToInfo[3];
                            data.date = XtenseParseDate(msgContent, l('dates')['messages']);
                            XtenseRequest.set('data', data);
                            XtenseRequest.set('type', 'messages');
                            XtenseRequest.send();
                            log("Message court Espionnage Ennemi envoyé ");
                        }
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

                    if (m != null && content.snapshotLength > 0) {
                        var data = {};
                        var coords = m[1];
                        var content = content.snapshotItem(0).textContent.trim();
                        data.type = 'expedition';
                        data.coords = coords;
                        data.content = content;

                        XtenseRequest.set('data', data);
                        XtenseRequest.set('type', 'messages');
                        XtenseRequest.send();
                        log("Message court Expédition envoyé");
                    }
                }

                // TODO : Cas de perte de contact avec la flotte attaquante
            }
        }
    }


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
                // Recupere le document parent du message detaille (la liste des messages court)
                var parentdoc = event.relatedNode.ownerDocument;
                // Recupere la liste des messages court
                var messagesShort = Xpath.getOrderedSnapshotNodes(parentdoc.body.ownerDocument, paths.shortmessages, null);
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
                    data.type = 'spy';
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
                            if (m2[2] == 'Lune') {
                                data.toMoon = 1;
                            }
                            data.fromMoon = 0;
                            if (m2[1] == 'Lune') {
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
                    data.type = 'expedition';
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
    this.lastShtMsgsSize = messagesCourt.snapshotLength;
    this.lastMsgsSize = messages.snapshotLength;
}

/* Fonction de parsing d'un RE */

function parse_spy_report(RE) {
    setStatus(XLOG_NORMAL, Xl('re_detected'));
    var paths = XtenseXpaths.messages.spy;
    var spyStrings = l('spy reports');
    var locales = l('messages');

    var data = {};
    var typs = [];
    var res = [];
    var attackRef = Xpath.getStringValue(document, paths.moon);
    var isMoon = attackRef.search('type=3') > -1 ? true : false;
    //isMoon = (moonNode.href).match(new RegExp(locales['moon'] + XtenseRegexps.moon))[1] == '3' ? true : false;
    var playerName = Xpath.getSingleNode(document, paths.playername).textContent.trim();
    var types = Xpath.getOrderedSnapshotNodes(document, paths.materialfleetdefbuildings);
    for (var i in spyStrings['units']) {
        for (var k = 0; k < types.snapshotLength; k++) {
            if (types.snapshotItem(k).textContent.trim().match(new RegExp(spyStrings['groups'][i], 'gi'))) {
                log("Groupe Trouvé = " + types.snapshotItem(k).textContent.trim());
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
                                    log("R="+XtenseDatabase.database[i][j] + " = " + data[XnewOgame.database[i][j]]);
                                }
                            }
                        } else {
                            for (var j in spyStrings['units'][i]) {
                                var m = getElementInSpyReport(types.snapshotItem(z).textContent.trim(), spyStrings['units'][i][j]);

                                if (m > -1) {
                                    data[XtenseDatabase[i][j]] = m;
                                    log("BT="+spyStrings['units'][i][j] + " = " + data[XnewOgame.database[i][j]]);
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
    var ogameAPILink = '';
    var actionsLinksNodes = Xpath.getOrderedSnapshotNodes(document, paths.actions_links);
    for (var cpt = 0; cpt < actionsLinksNodes.snapshotLength; cpt++) {
        if (actionsLinksNodes.snapshotItem(cpt).href != null
            && actionsLinksNodes.snapshotItem(cpt).href.match(new RegExp(spyStrings['ogameAPI_link']))) {
            ogameAPILink = actionsLinksNodes.snapshotItem(cpt).href;
            break;
        }
    }
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
    log(elem + " : " + num);
    return num;
}

/*********************** Utilities Ogame ********************************/
/* Recuperation des données de la planète */

function getPlanetData() {
    var planet_type = '';
    if (XtenseMetas.getPlanetType() == 'moon') {
        planet_type = '1';
    } else {
        planet_type = '0';
    }
    //log("planet_name: "+XtenseMetas.getPlanetName()+", coords : "+XtenseMetas.getPlanetCoords()+", planet_type : "+planet_type);

    return {
        planet_name: XtenseMetas.getPlanetName(),
        coords: XtenseMetas.getPlanetCoords(),
        planet_type: planet_type
    };
}

function getPlanetBoostersAndExtensions() {

    var items = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.boostersExtensions['items']);

    var datas = Array();
    if (items != null && items.snapshotLength > 0) {
        for (var i = 0; i < items.snapshotLength; i++) {
            var item = items.snapshotItem(i);
            var uuid = Xpath.getStringValue(document, XtenseXpaths.boostersExtensions['dataUuid'], item);
            var title = Xpath.getStringValue(document, XtenseXpaths.boostersExtensions['itemTime'], item);
            var temps = "";

            if (title != null) {
                temps = title.match(/([\w\d\s]+)/);

                if (temps != null && temps.length > 1) {
                    temps = temps[1];
                }
            }
            datas.push(Array(uuid, temps));
        }
    }

    return {boostExt: datas};
}


// Permet de savoir si c'est une lune

function isMoon() {
    if (XtenseMetas.getPlanetType() == 'moon') {
        return true;
    } else {
        return false;
    }
}

// Permet de stocker les planètes du joueur connecté

function save_my_planets_coords() {
    var mesPlanetes = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.planetData['coords']);
    var pls = '';
    if (mesPlanetes != null && mesPlanetes.snapshotLength > 0) {
        for (var i = 0; i < mesPlanetes.snapshotLength; i++) {
            pls += mesPlanetes.snapshotItem(i).textContent.trim() + ((i < (mesPlanetes.snapshotLength - 1)) ? ';' : '');
        }
    }
    GM_setValue('my.planets', pls);
}

// Récupération des ressources d'une planète

function getResources() {
    var metal = Xpath.getStringValue(document, XtenseXpaths.ressources.metal).trimInt();
    var cristal = Xpath.getStringValue(document, XtenseXpaths.ressources.cristal).trimInt();
    var deut = Xpath.getStringValue(document, XtenseXpaths.ressources.deuterium).trimInt();
    var antimater = Xpath.getStringValue(document, XtenseXpaths.ressources.antimatiere).trimInt();
    var energy = Xpath.getStringValue(document, XtenseXpaths.ressources.energie).trimInt();
    log('metal=' + metal + ', crystal=' + cristal + ', deuterium=' + deut + ', antimatiere=' + antimater + ', energie=' + energy);
    return Array(metal, cristal, deut, antimater, energy);
}
/********************* Fin Utilities Ogame ******************************/