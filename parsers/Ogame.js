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
        if (GM_getValue(prefix_GMData + 'handle.system', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            GM_setValue(prefix_GMData + 'lastAction', '');
            get_galaxycontent();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regOverview.test(url)) {
        save_my_planets_coords();
        if (GM_getValue(prefix_GMData + 'handle.overview', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            get_planet_details();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regResearch.test(url)) {
        if (GM_getValue(prefix_GMData + 'handle.researchs', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            parse_researchs();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regBuildings.test(url)) {
        if (GM_getValue(prefix_GMData + 'handle.buildings', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            parse_buildings();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regStation.test(url)) {
        if (GM_getValue(prefix_GMData + 'handle.station', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            parse_station();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regShipyard.test(url) || regFleet1.test(url)) {
        if (GM_getValue(prefix_GMData + 'handle.shipyard', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            parse_shipyard();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regDefense.test(url)) {
        if (GM_getValue(prefix_GMData + 'handle.defense', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            parse_defense();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regMessages.test(url)) {
        if (GM_getValue(prefix_GMData + 'handle.msg.msg', 'false').toString() == 'true' ||
            GM_getValue(prefix_GMData + 'handle.msg.ally', 'false').toString() == 'true' ||
            GM_getValue(prefix_GMData + 'handle.msg.spy', 'false').toString() == 'true' ||
            GM_getValue(prefix_GMData + 'handle.msg.ennemy.spy', 'false').toString() == 'true' ||
            GM_getValue(prefix_GMData + 'handle.msg.rc.cdr', 'false').toString() == 'true' ||
            GM_getValue(prefix_GMData + 'handle.msg.expeditions', 'false').toString() == 'true' ||
            GM_getValue(prefix_GMData + 'handle.msg.commerce', 'false').toString() == 'true'
        ) {
            get_message_content();
        }
    } else if (regAlliance.test(url)) {
        if (GM_getValue(prefix_GMData + 'handle.alliance', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            GM_setValue(prefix_GMData + 'lastAction', '');
            parse_ally_inserted();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else if (regStats.test(url)) {
        if (GM_getValue(prefix_GMData + 'handle.stats', 'false').toString() == 'true' || GM_getValue(prefix_GMData + 'manual.send', 'false').toString() == 'true') {
            GM_setValue(prefix_GMData + 'lastAction', '');
            get_ranking_content();
            GM_setValue(prefix_GMData + 'manual.send', 'false');
        } else {
            manual_send();
        }
    } else {
        setStatus(XLOG_NORMAL, Xl('unknow_page'));
    }
}

/* Fonction d'envoi manuel */

function manual_send() {
    GM_setValue(prefix_GMData + 'manual.send', 'true');
    displayXtense();
    setStatus(XLOG_SEND, Xl('wait_send'));
}

/************************ Declenchement des Parsings sur Remplissage Ajax ************************/
/* Fonction ajoutant lancant le parsing de la vue galaxie quand celle-ci est chargée */

function get_galaxycontent() {
    var target = document.getElementById('galaxyContent');
    target.addEventListener('DOMNodeInserted', parse_galaxy_system_inserted, false);
    target.addEventListener('DOMContentLoaded', parse_galaxy_system_inserted, false);
}
/* Fonction ajoutant lancant le parsing de la vue alliance quand celle-ci est chargée */

function get_ally_content() {
    log('In get_ally_content()');
    var target = document.getElementById('inhalt');
    target.addEventListener('DOMNodeInserted', parse_ally_inserted, false);
    target.addEventListener('DOMContentLoaded', parse_ally_inserted, false);
}
/* Fonction ajoutant lancant le parsing de la vue classement quand celle-ci est chargée */

function get_ranking_content() {
    log('Entering get_ranking_content');
    var target = document.getElementById('stat_list_content');
    target.addEventListener('DOMNodeInserted', parse_ranking_inserted, false);
    target.addEventListener('DOMContentLoaded', parse_ranking_inserted, false);
}
/* Fonction ajoutant lancant le parsing de la vue classement quand celle-ci est chargée */

function get_message_content() {
    //log('Entering get_message_content');
    var target = document.getElementById('messages');
    target.addEventListener('DOMNodeInserted', parse_messages, false);
    //target.addEventListener('DOMContentLoaded', parse_messages, false);
    /*var targetrc = document.getElementById('combatreport');
     targetrc.addEventListener('DOMNodeInserted', parse_rc, false);
     targetrc.addEventListener('DOMContentLoaded', parse_rc, false);*/
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
    if (GM_getValue(prefix_GMData + 'lastAction', '') != 's:' + galaxy + ':' + system) {
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
            GM_setValue(prefix_GMData + 'lastAction', 's:' + coords[0] + ':' + coords[1]);
        }
    }
}
/* Fonction appelée lors d'évenement sur le chargement de la page d'alliance */

function parse_ally_inserted() {
    //log("last_action="+GM_getValue(prefix_GMData +'lastAction',''));
    if (GM_getValue(prefix_GMData + 'lastAction', '') != 'ally_list') {
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
            GM_setValue(prefix_GMData + 'lastAction', 'ally_list')
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
        if (GM_setValue(prefix_GMData + 'lastAction', '') != 'r:' + type[0] + ':' + type[1] + ':' + offset) {
            setStatus(XLOG_NORMAL, Xl('ranking_detected', Xl('ranking_' + type[0]), Xl('ranking_' + type[1])));
            GM_setValue(prefix_GMData + 'lastAction', 'r:' + type[0] + ':' + type[1] + ':' + offset);
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
        if (GM_getValue(prefix_GMData + 'lastAction', '') != 'planet_name:' + planetData.planet_name) {
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
            GM_setValue(prefix_GMData + 'lastAction', 'planet_name:' + planetData.planet_name);
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

function parse_rc(doc) {

    var paths = XtenseXpaths.rc;
    log('RC detected');
    var rcStrings = l('combat report');
    var data = {};
    var rnds = {};
    var rslt = {};
    var date = null;
    var infos = Xpath.getOrderedSnapshotNodes(doc, paths.list_infos);
    if (infos.snapshotLength > 0) {
        //Heure et rounds
        var rounds = Xpath.getOrderedSnapshotNodes(doc, paths.list_rounds);
        var nbrounds = rounds.snapshotLength;
        if (nbrounds > 0) {
            for (var div = 0; div < nbrounds; div++) {
                var round = rounds.snapshotItem(div).textContent.trim();
                if (div == 0) {
                    var m = round.match(new RegExp(rcStrings['regxps']['time']));
                    if (m) {
                        // Calcul heure d'ete => offset = -120 & heure d'hiver  => offset = -60
                        var diff = new Date(Date.UTC(m[3], (m[2] - 1), m[1], m[4], m[5], m[6])).getTimezoneOffset();
                        var correction = 0;
                        if (diff == -120) {
                            correction = 2;
                        } else if (diff == -60) {
                            correction = 1;
                        }
                        date = (Date.UTC(m[3], (m[2] - 1), m[1], (parseInt(m[4].replace(new RegExp('0(\\d)'), '$1')) - correction), m[5], m[6])) / 1000;
                    } else {
                        date = Math.ceil((new Date().getTime()) / 1000);
                    }
                } else {
                    var rnd = {};
                    for (var i in rcStrings['regxps']['round']) {
                        var m = round.match(new RegExp(rcStrings['regxps']['round'][i]));
                        if (m)
                            rnd[i] = m[1].replace(/\./g, '');
                    }
                    rnds[div] = rnd;
                }
            }
        }
        //Vaisseaux/Défenses/Joueur/Coordonnées/Technos

        var rc_temp = eval(GM_getValue(prefix_GMData + 'rc-temp'));
        //Coordonnées de destination
        for (var table = 0; table < infos.snapshotLength; table++) {
            var dat = {};
            var val = {};
            var weap = {};
            var info = infos.snapshotItem(table);
            var nbJoueurs = infos.snapshotLength / nbrounds;
            //Nombre d'unités
            var values = Xpath.getOrderedSnapshotNodes(doc, paths.list_values, info);
            if (values.snapshotLength > 0) {
                for (var td = 1; td < values.snapshotLength; td++) {
                    var value = values.snapshotItem(td).textContent.trim();
                    if (value) {
                        val[td] = value.replace(/\./g, '');
                    }
                }
            }
            //Type de l'unité

            var types = Xpath.getOrderedSnapshotNodes(doc, paths.list_types, info);
            if (types.snapshotLength > 0) {
                for (var th = 1; th < types.snapshotLength; th++) {
                    var type = types.snapshotItem(th).textContent.trim();
                    if (type) {
                        for (var i in rcStrings['units']) {
                            for (var j in rcStrings['units'][i]) {
                                var typ = type.match(new RegExp(rcStrings['units'][i][j]));
                                if (typ)
                                    dat[XtenseDatabase[i][j]] = val[th];
                            }
                        }
                    }
                }
            }
            //Nom joueur et coordonnées

            var dest = 0;
            var player = Xpath.getStringValue(doc, paths.infos.player, info).trim();
            //Joueur non détruit
            var coords = null;
            if (player.length == 0) {
                //Dans ce cas, joueur détruit
                player = Xpath.getStringValue(doc, paths.infos.destroyed, info).trim();
                dest = 1;
            }
            if (!dest)
                var m = player.match(new RegExp(rcStrings['regxps']['attack'] + XtenseRegexps.planetNameAndCoords));
            else
                var m = player.match(new RegExp(rcStrings['regxps']['attack'] + XtenseRegexps.userNameAndDestroyed));
            if (m) {
                var player = m[1];
                if (!dest)
                    coords = m[2];
                else
                    coords = data[(table - nbJoueurs) % nbJoueurs]['coords'];
                //Joueur détruit, on récupère ses coordonnées lorsqu'il était encore vivant
                var type = 'A';
            } else {
                if (!dest)
                    var m = player.match(new RegExp(rcStrings['regxps']['defense'] + XtenseRegexps.planetNameAndCoords));
                else
                    var m = player.match(new RegExp(rcStrings['regxps']['defense'] + XtenseRegexps.userNameAndDestroyed));
                if (m) {
                    var player = m[1];
                    if (!dest)
                        var coords = m[2];
                    else {
                        if (rc_temp != '')
                            var coords = rc_temp.coords;
                        //Si défenseur où à lieu le raid est détruit au 1er tour
                        else
                            var coords = data[(table - nbJoueurs) % nbJoueurs]['coords'];
                        // Si ce n'est pas le 1er round
                    }
                    rc_temp = '';
                } else {
                    var player = '';
                    var coords = '';
                }
                var type = 'D';
            }
            //Technos

            var weapons = Xpath.getStringValue(doc, paths.infos.weapons, info).trim();
            for (var i in rcStrings['regxps']['weapons']) {
                var m = weapons.match(new RegExp(rcStrings['regxps']['weapons'][i]));
                if (m)
                    weap[i] = m[1].replace(/\./g, '');
                else {
                    //Joueur détruit
                    if ((table - nbJoueurs) < 0)
                    //Défenseur où à lieu le raid détruit au 1er tour -> technos inutiles
                        weap[i] = 0;
                    else
                        weap[i] = data[(table - nbJoueurs) % nbJoueurs]['weapons'][i];
                    //On récupère ses technos lorsqu'il était encore vivant
                }
            }
            if (coords != '')
                data[table] = {
                    player: player,
                    coords: coords,
                    type: type,
                    weapons: weap,
                    content: dat
                };
        }
        //Pillages/Pertes/Cdr/Lune

        var result = Xpath.getStringValue(doc, paths.result).trim();
        if (result.match(new RegExp(rcStrings['regxps']['nul'], 'gi')))
            var win = 'N';
        else if (result.match(new RegExp(rcStrings['regxps']['attack_win'], 'gi')))
            var win = 'A';
        else
            var win = 'D';
        if (result.match(new RegExp(rcStrings['regxps']['moon'], 'gi')))
            var moon = 1;
        else
            var moon = 0;
        if (result.match(new RegExp(rcStrings['regxps']['moonprob'], 'gi')))
            var moonprob = result.match(new RegExp(rcStrings['regxps']['moonprob']))[1];
        else
            var moonprob = 0;
        for (var i in rcStrings['regxps']['result']) {
            var m = result.match(new RegExp(rcStrings['regxps']['result'][i]));
            if (m)
                rslt[i] = m[1].replace(/\./g, '');
            else
                rslt[i] = 0;
        }
        //Texte entier du raid, brut

        var rounds = Xpath.getOrderedSnapshotNodes(doc, paths.combat_round);
        var round = -1;
        log('Nb Rounds' + rounds.snapshotLength);
        if (rounds.snapshotLength > 0) {
            round = rounds.snapshotItem(0).textContent.trim();
        }
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
            rawdata: round
        });
        XtenseRequest.send();
    }
}
/* Page Messages */

function parse_messages() {
    setStatus(XLOG_NORMAL, Xl('messages_detected'));
    var paths = XtenseXpaths.messages;
    var data = {};
    var messages = Xpath.getOrderedSnapshotNodes(document, paths.showmessage, null);
    var messageNode = messages.snapshotItem(0);
    var messageId = Xpath.getStringValue(document, paths.messageid, messageNode);
    var combatreport = Xpath.getOrderedSnapshotNodes(document, paths.combatreport, null);
    // Detection du rapport de combat (Sous fenetre)
    if (combatreport.snapshotLength > 0) {
        log('Traitement du rapport de combat');
        if (GM_getValue(prefix_GMData + 'handle.msg.rc').toString() == 'true') {
            parse_rc({parameters: {doc: document}});
        }
    } else if (Xpath.getStringValue(document, paths.from).trim() != '') {
        var from = Xpath.getStringValue(document, paths.from).trim();
        var to = Xpath.getStringValue(document, paths.to).trim();
        var subject = Xpath.getStringValue(document, paths.subject).trim();
        var date = Xpath.getStringValue(document, paths.date).trim();
        var locales = l('messages');
        data.date = XtenseParseDate(date, l('dates')['messages']);

        if (data.date.toString() != GM_getValue(prefix_GMData + 'last_message').toString()) {
            data.type = '';
            log('from: ' + from);
            log('to: ' + to);
            log('subject: ' + subject);
            log('date: ' + data.date);
            GM_setValue(prefix_GMData + 'last_message', data.date);
            // Messages de joueurs
            if (GM_getValue(prefix_GMData + 'handle.msg.msg').toString() == 'true') {
                if (Xpath.getOrderedSnapshotNodes(document, paths.reply).snapshotLength > 0) {
                    // si bouton "repondre", c'est un mp
                    var m = from.match(new RegExp(XtenseRegexps.userNameAndCoords));
                    if (m) {
                        var userName = m[1];
                        var coords = m[2];
                    }
                    var contentNode = Xpath.getSingleNode(document, paths.contents['msg']);
                    var message = contentNode.innerHTML.trim();
                    var ladate = data.date;
                    //correctif : pas de date
                    // si on procede comme suit : on redefini la variable data et on perd "date"
                    //data = {type:'msg', from: userName, coords: coords, subject: subject, message: message};
                    data.type = 'msg';
                    data.from = userName;
                    data.coords = coords;
                    data.subject = subject;
                    data.message = message;
                    // fin correctif
                }
            }
            // Messages d'alliance

            if (GM_getValue(prefix_GMData + 'handle.msg.ally').toString() == 'true') {
                var m = from.match(new RegExp(XtenseRegexps.ally));
                if (m) {
                    var contentNode = Xpath.getSingleNode(document, paths.contents['ally_msg']);
                    var message = contentNode.innerHTML;
                    data.type = 'ally_msg';
                    data.from = subject.match(new RegExp(XtenseRegexps.ally_msg_player_name))[1];
                    data.tag = m[1];
                    data.message = message.match(new RegExp(XtenseRegexps.ally_msg_player_infos))[1];
                }
            }
            // Espionnages perso

            if (GM_getValue(prefix_GMData + 'handle.msg.spy').toString() == 'true') {
                var m = subject.match(new RegExp(locales['espionage of'] + XtenseRegexps.planetNameAndCoords));
                if (m) {
                    setStatus(XLOG_NORMAL, Xl('re_detected'));
                    var contentNode = Xpath.getSingleNode(document, paths.contents['spy']);
                    var content = contentNode.innerHTML;
                    data.planetName = m[1];
                    data.coords = m[2];
                    data.proba = 0;
                    m = content.match(new RegExp(locales['unespionage prob'] + XtenseRegexps.probability));
                    if (m)
                        data.proba = m[1];
                    data.activity = 0;
                    m = content.match(new RegExp(locales['activity']));
                    if (m)
                        data.activity = m[1];
                    Ximplements(data, parse_spy_report(content));
                    data.type = 'spy';
                }
            }
            // Espionnages ennemis

            if (GM_getValue(prefix_GMData + 'handle.msg.ennemy.spy').toString() == 'true') {
                if (subject.match(new RegExp(locales['espionnage action']))) {
                    var contentNode = Xpath.getSingleNode(document, paths.contents['ennemy_spy']);
                    var rawdata = contentNode.textContent.trim();
                    var m = rawdata.match(new RegExp(XtenseRegexps.messages.ennemy_spy));
                    if (m) {
                        data.type = 'ennemy_spy';
                        data.from = m[1];
                        data.to = m[2];
                        data.proba = m[3];
                    }
                }
            }
            //RC

            /*           if (GM_getValue(prefix_GMData + 'handle.msg.rc').toString() == 'true') {
             var m = subject.match(new RegExp(locales['combat of']));
             if (m != null) {
             var rapport = Xpath.getStringValue(document, paths.contents['rc']).trim();
             var m2 = rapport.match(new RegExp(locales['combat defence'] + XtenseRegexps.planetNameAndCoords));
             if (m2) GM_setValue(prefix_GMData + 'rc-temp', '({name: "' + m2[1] + '", coords: "' + m2[2] + '"})');
             }
             }*/
            if (GM_getValue(prefix_GMData + 'handle.msg.rc').toString() == 'true') {
                var m = subject.match(new RegExp(locales['combat of']));
                if (m != null) {
                    var rapport = Xpath.getStringValue(document, paths.contents['rc']).trim();
                    var m2 = rapport.match(new RegExp(locales['combat defence'] + XtenseRegexps.planetNameAndCoords));
                    if (!m2) {
                    } else {
                        log('Before setChar rc-temp : ({name: "' + m2[1] + '", coords: "' + m2[2] + '"})');
                        GM_setValue(prefix_GMData + 'rc-temp', '({name: "' + m2[1] + '", coords: "' + m2[2] + '"})');

                        this.lastAction = "message:" + messageId;

                        log("Traitement du rapport de combat (" + messageId + ") dans les messages");
                        var urlRc = Xpath.getStringValue(document, paths.contents['url_combatreport']).trim();
                        log(urlRc.toString());
                        var rcString = XajaxCompo(urlRc);


                    }
                }
            }
            // Recyclages

            if (GM_getValue(prefix_GMData + 'handle.msg.rc.cdr').toString() == 'true') {
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
                }
            }
            // Expeditions

            if (GM_getValue(prefix_GMData + 'handle.msg.expeditions').toString() == 'true') {
                var m = subject.match(new RegExp(locales['expedition result'] + XtenseRegexps.planetCoords));
                var m2 = from.match(new RegExp(locales['fleet command']));
                if (m2 != null && m != null) {
                    var coords = m[1];
                    var contentNode = Xpath.getSingleNode(document, paths.contents['expedition']);
                    var message = Xpath.getStringValue(document, paths.contents['expedition']).trim();
                    var message = message.replace(/\(AM\)/g, '');
                    data.type = 'expedition';
                    data.coords = coords;
                    data.content = message;
                }
            }
            // Commerce

            if (GM_getValue(prefix_GMData + 'handle.msg.commerce').toString() == 'true') {
                var m = subject.match(new RegExp(locales['trade message 1']));
                var m2 = subject.match(new RegExp(locales['trade message 2']));
                // Livraison d'un ami sur une de mes planètes
                if (m != null) {
                    var message = Xpath.getStringValue(document, paths.contents['livraison']).trim();
                    var infos = message.match(new RegExp(XtenseRegexps.messages.trade_message_infos));
                    var ressourcesLivrees = message.match(new RegExp(XtenseRegexps.messages.trade_message_infos_res_livrees));
                    // ressources livrées
                    var ressources = ressourcesLivrees[1].match(new RegExp(XtenseRegexps.messages.trade_message_infos_res));
                    // Quantité de ressources livrées
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
                    log('Livraison du joueur (' + infos[1].trim() + ') de la planète ' + infos[2].trim() + '(' + infos[3].trim() + ')sur ma planète ' + infos[4].trim() + '(' + infos[5].trim() + ') : Metal=' + met + ' Cristal=' + cri + ' Deuterium=' + deut);
                } else if (m2 != null) {
                    // Livraison sur la planète d'un ami
                    var message = Xpath.getStringValue(document, paths.contents['livraison_me']).trim();
                    // Corps du message
                    var infos = message.match(new RegExp(XtenseRegexps.messages.trade_message_infos_me));
                    // Infos sur la planète
                    var planeteLivraison = infos[4].trim();
                    // Planete sur laquelle la livraison à eu lieu
                    // Récupération de mes planètes
                    //var mesPlanetes = Xpath.getOrderedSnapshotNodes(window.parent.document,XtenseXpaths.planetData['coords']);
                    var mesPlanetes = GM_getValue(prefix_GMData + 'my.planets', '').split(';');
                    var isMyPlanet = false;
                    log('J\'ai ' + mesPlanetes.length + ' planètes');
                    // Parcours de mes planète pour s'assurer que ce n'est pas une des mienne
                    if (mesPlanetes != null && mesPlanetes.length > 0) {
                        for (var i = 0; i < mesPlanetes.length; i++) {
                            var coord = mesPlanetes[i];
                            log('Coordonnees=' + coord + ' | planeteLivraison=' + planeteLivraison);
                            if (coord.search(planeteLivraison) > -1) {
                                isMyPlanet = true;
                                break;
                            }
                        }
                    }
                    // Livraison sur une planète amie ?

                    if (!isMyPlanet) {
                        var ressources = message.match(new RegExp(XtenseRegexps.messages.trade_message_infos_me_res));
                        // Quantité de ressources livrées
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
                        log('Je livre de ma planète ' + infos[1].trim() + '(' + infos[2].trim() + ') sur la planète ' + infos[3].trim() + '(' + infos[4].trim() + ') : Metal=' + met + ' Cristal=' + cri + ' Deuterium=' + deut);
                    }
                }
            }
            // Aucun message

            if (data.type == '') {
                setStatus(XLOG_NORMAL, Xl('no_messages'));
                return false;
            } else {
                XtenseRequest.set('data', data);
                XtenseRequest.set('type', 'messages');
                XtenseRequest.send();
            }

        }
    }
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
    var playerName = Xpath.getStringValue(document, paths.playername).trim();
    var types = Xpath.getOrderedSnapshotNodes(document, paths.materialfleetdefbuildings);
    if (types.snapshotLength > 0) {
        for (var table = 0; table < types.snapshotLength; table++) {
            var type = types.snapshotItem(table).textContent.trim();
            if (type)
                typs.push(type);
        }
    }
    for (var i in spyStrings['units']) {
        for (var k = 0; k < typs.length; k++) {
            if (typs[k].match(new RegExp(spyStrings['groups'][i], 'gi'))) {
                for (var j in spyStrings['units'][i]) {
                    var m = getElementInSpyReport(RE, spyStrings['units'][i][j]);
                    if (m != -1)
                        data[XtenseDatabase[i][j]] = m;
                    else
                        data[XtenseDatabase[i][j]] = 0;
                }
            }
        }
    }
    return {
        content: data,
        playerName: playerName,
        moon: isMoon
    };
}
/* Fonction de récupération de données dans un RE */

function getElementInSpyReport(RE, elem) {
    var num = -1;
    var reg = new RegExp(elem + '\\D+(\\d[\\d.]*)');
    //recupere le nombre le plus proche apres le texte
    var m = reg.exec(RE);
    if (m)
        num = m[1].trimInt();
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
            var title = Xpath.getStringValue(document, XtenseXpaths.boostersExtensions['title'], item);
            var temps = "";

            if (title != null) {
                temps = title.match(/Temps restant : ([\w\d\s]+)/);

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
    GM_setValue(prefix_GMData + 'my.planets', pls);
}
// Récupération des ressources d'une planète

function getResources() {
    var metal = Xpath.getStringValue(document, XtenseXpaths.ressources.metal).trimInt();
    var cristal = Xpath.getStringValue(document, XtenseXpaths.ressources.cristal).trimInt();
    var deut = Xpath.getStringValue(document, XtenseXpaths.ressources.deuterium).trimInt();
    var antimater = Xpath.getStringValue(document, XtenseXpaths.ressources.antimatiere).trimInt();
    var energy = Xpath.getStringValue(document, XtenseXpaths.ressources.energie).trimInt();
    log('metal=' + metal + ', cristal=' + cristal + ', deuterium=' + deut + ', antimatiere=' + antimater + ', energie=' + energy);
    return Array(metal, cristal, deut, antimater, energy);
}
/********************* Fin Utilities Ogame ******************************/