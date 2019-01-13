/**
 * Created by Anthony on 13/12/2015.
 */

function handle_current_page() {
    // Expressions régulières des pages
    var regGalaxy;
    regGalaxy = new RegExp(/page=(galaxy)/);
    var regOverview = new RegExp(/page=(overview)/);
    var regOption = new RegExp(/page=(xtense=Options)/);
    var regResearch = new RegExp(/page=(research)/);
    var regBuildings = new RegExp(/page=(resources)/);
    var regStation = new RegExp(/page=(station)/);
    var regShipyard = new RegExp(/page=(shipyard)/);
    var regFleet1 = new RegExp(/page=(fleet1)/);
    var regDefense = new RegExp(/page=(defense)/);
    var regMessages = new RegExp(/page=(messages)/);
    var regAlliance = new RegExp(/page=(alliance)/);
    var regStats = new RegExp(/page=(highscore)/);

    if (regOption.test(url)) {
        displayOptions();
    } else if (regGalaxy.test(url)) {
        handle_page('system');
    } else if (regOverview.test(url)) {
        save_my_planets_coords();
        handle_page('overview');
    } else if (regResearch.test(url)) {
        handle_page('researchs');
    } else if (regBuildings.test(url)) {
        handle_page('buildings');
    } else if (regStation.test(url)) {
        handle_page('station');
    } else if (regShipyard.test(url)) {
        handle_page('shipyard');
    } else if (regFleet1.test(url)) {
        handle_page('fleet');
    } else if (regDefense.test(url)) {
        handle_page('defense');
    } else if (regMessages.test(url)) {
        if (GM_getValue('handle.msg.msg', 'false').toString() === 'true' ||
            GM_getValue('handle.msg.ally', 'false').toString() === 'true' ||
            GM_getValue('handle.msg.spy', 'false').toString() === 'true' ||
            GM_getValue('handle.msg.ennemy.spy', 'false').toString() === 'true' ||
            GM_getValue('handle.msg.rc.cdr', 'false').toString() === 'true' ||
            GM_getValue('handle.msg.expeditions', 'false').toString() === 'true' ||
            GM_getValue('handle.msg.commerce', 'false').toString() === 'true'
        ) {
            get_message_content();
        }
    } else if (regAlliance.test(url)) {
        handle_page('alliance');
    } else if (regStats.test(url)) {
        handle_page('stats');
    } else {
        setStatus(XLOG_NORMAL, Xl('unknow_page'));
    }
}

/**
 * Gestion de la page
 * @param page
 */
function handle_page(page)
{
    if(GM_getValue('handle.'.concat(page), 'false').toString() === 'true' || GM_getValue('manual.send', 'false').toString() === 'true')
    {
        GM_setValue('lastAction', '');
        get_content(page);
        GM_setValue('manual.send', 'false');
    } else {
        manual_send();
    }
}

/* Fonction d'envoi manuel */

function manual_send() {
    GM_setValue('manual.send', 'true');
    displayXtense();
    setStatus(XLOG_SEND, Xl('wait_send'));
}

/************************ Declenchement des Parsings sur Remplissage Ajax ************************/
function get_content(type)
{
    var elementName;
    var func;
    switch (type)
    {
        case 'system': // Fonction lancant le parsing de la vue galaxie quand celle-ci est chargée
            elementName = 'galaxyContent';
            func = parse_galaxy_system_inserted;
            break;
        case 'stats':
            elementName = 'stat_list_content';
            func = parse_ranking_inserted;
            break;
        case 'overview':
            elementName = 'planetdata';
            func = parse_overview;
            break;
        case 'researchs':
            func = parse_researchs;
            break;
        case 'buildings':
            func = parse_buildings;
            break;
        case 'station':
            func = parse_station;
            break;
        case 'shipyard':
            func = parse_shipyard;
            break;
        case 'fleet':
            func = parse_fleet;
            break;
        case 'defense':
            func = parse_defense;
            break;
        case 'alliance':
            elementName = 'eins';
            func = parse_ally_inserted;
            break;
    }

    if(elementName != null) {
        var target = document.getElementById(elementName);
        //console.log(document.body.serializeWithStyles());
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                log('Mutation Observer : ' + mutation.addedNodes);
                func();
            })
        });
		// configuration of the observer:
		var config = { attributes: true, childList: true, characterData: true };
        observer.observe(target, config);
    }

    log('Static Observer : ' + 'Running ' + type );
    func();
}

/* Fonction ajoutant lancant le parsing de la vue alliance quand celle-ci est chargée */

function get_ally_content() {

    var target = document.getElementById('inhalt');
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            parse_ally_inserted();
        });
    });
	var config = { attributes: true, childList: true, characterData: true };
    observer.observe(target, config);
}

/* Fonction ajoutant lancant le parsing de la vue classement quand celle-ci est chargée */

function get_message_content() {
    //Sur navigation onglets
    //$('#buttonz').click(function(){ parse_messages(); }); //Spy reports list

    //Sur affichage Message long
    var target = document.getElementById('messages');
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if(mutation.addedNodes.length == 0)
                return;
            var node = mutation.addedNodes[0];
            switch(node.id)
            {
                case  'fleetsgenericpage':
                case 'communicationmessagespage':
                case 'defaultmessagespage':
                    break;
                default:
                    if(node.className !== 'pagination')
                        return;
            }

            log('Mutation Message');
            parse_messages();
        });
    });
    var config = { attributes: false, childList: true, characterData: false, subtree: true };
    observer.observe(target, config);

    parse_messages(); // Première Page

}

/************************ PARSING DES PAGES  ***************************/
/* Fonction appelée lors d'évenement sur le chargement du contenu galaxie */

function parse_galaxy_system_inserted(event) {
    log('In parse_galaxy_system_inserted()');
    //var doc = event.target.ownerDocument;
    var paths = XtenseXpaths.galaxy;
    //Référence Xpaths
    var galaxyInput = Xpath.getSingleNode(document, paths.galaxy_input);
    if(galaxyInput === null)
        return;
    var galaxy = galaxyInput.value.trim();
    //Récupération Galaxie
    var system = Xpath.getSingleNode(document, paths.system_input).value.trim();
    //Récupération SS
    var rows = Xpath.getUnorderedSnapshotNodes(document, paths.rows);
    //log("lastAction : "+GM_getValue(prefix_GMData +'lastAction',''));
    if (GM_getValue('lastAction', '') !== 's:' + galaxy + ':' + system) {
        var coords = [
            galaxy,
            system
        ];
        if (isNaN(coords[0]) || isNaN(coords[1])) {
            log('invalid system' + ' ' + coords[0] + ' ' + coords[1]);
            return;
        }
        setStatus(XLOG_NORMAL, Xl('system_detected') + "(" + coords[0] + ":" + coords[1] + ")");
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
                if (player_tooltip === '') {
                    if (player === '') {
                        if (player2 === '') {
                            log('row ' + (i + 1) + ' has no player name');
                            continue;
                        } else
                            player = player2;
                    }
                } else
                    player = player_tooltip;
                if (name_tooltip === '') {
                    if (name === '') {
                        if (name_l === '') {
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
                        status += statusNodes.snapshotItem(j).textContent.trim();
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
                if (player_id !== '') {
                    player_id = player_id.trimInt();
                } else if (player) {
                    player_id = XtenseMetas.getPlayerId();
                }
                var allyid = Xpath.getStringValue(document, paths.ally_id, row).trim();
                if (allyid !== '') {
                    allyid = allyid.trimInt();
                    log('Ally id' + allyid);
                } else {
                    allyid = '0';
                }
                var planet_id = Xpath.getStringValue(document, paths.planet_id, row).trim();
                var moon_id = Xpath.getStringValue(document, paths.moon_id, row).trim();
                log('row ' + position + ' > player_id:' + player_id + ',planet_name:' + name + ',planet_id:' + planet_id + ',moon_id:' + moon_id + ',moon:' + moon + ',player_name:' + player + ',status:' + status + ',ally_id:' + allyid + ',ally_tag:' + allytag + ',debris:(' + debris[XtenseDatabase['resources'][601]] + '/' + debris[XtenseDatabase['resources'][602]] + '),activity:' + activity + ',activity_moon:' + activityMoon);
                rowsData[position] = {
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
            }
            XtenseRequest.set({
                row: rowsData,
                galaxy: coords[0],
                system: coords[1],
                type: 'system'
            });
            XtenseRequest.set('og_lang', langUnivers);
            XtenseRequest.send();
            GM_setValue('lastAction', 's:' + coords[0] + ':' + coords[1]);
        }
    }
}
/* Fonction appelée lors d'évenement sur le chargement de la page d'alliance */

function parse_ally_inserted() {
    //log("last_action="+GM_getValue(prefix_GMData +'lastAction',''));
    if (GM_getValue('lastAction', '') !== 'ally_list') {
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
            coords = coords.match(new RegExp(XtenseRegexps.coords))[0];
            rowsData[i] = {
                player: player,
                points: points,
                coords: coords,
                rank: rank
            };
            log("Player: " + rowsData[i].player +  " Points: " + rowsData[i].points +" Coords: " + rowsData[i].coords + " Rank: " + rowsData[i].rank);
        }
        if (rowsData.length > 0) {
            var tag = Xpath.getStringValue(document, paths.tag);
            XtenseRequest.set({
                n: rowsData,
                type: 'ally_list',
                tag: tag
            });
            XtenseRequest.set('og_lang', langUnivers);
            XtenseRequest.send();
            GM_setValue('lastAction', 'ally_list')
        }
        get_ally_content(); // Pourquoi celui-ci est fait à l'envers par rapport aux autres ?
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
        type[0] = (type[0] !== '') ? type[0] : 'player';
        type[0] = (type[0] === 'alliance') ? 'ally' : type[0];
        type[1] = (type[1] !== '') ? type[1] : 'points';
        var length = 0;
        //var rows = Xpath.getOrderedSnapshotNodes(document,paths.rows,null);
        var offset = 0;
        log('time:' + time + ',type1:' + type[0] + ',type2:' + type[1] + ',type3: ' + type[2] + ',nombreLignes:' + rows.snapshotLength);
        //if(rows.snapshotLength > 0){ //Double sécurité
        var rowsData = [];
        for (var i = 0; i < rows.snapshotLength; i++) {
            var row = rows.snapshotItem(i);
            var n = Xpath.getStringValue(document, paths.position, row).trimInt();
            if (i === 1) {
                offset = Math.floor(n / 100) * 100 + 1;
                //parce que le nouveau classement ne commence pas toujours pile a la centaine et OGSpy toujours a 101,201...
            }
            var ally = Xpath.getStringValue(document, paths.allytag, row).trim().replace(/\]|\[/g, '');
            var ally_id = Xpath.getStringValue(document, paths.ally_id, row).trim();
            if (ally_id !== '' && !ally_id.match(/page\=alliance/)) {
                //Pas d'id sur le lien de sa propre alliance (dans les classements alliances)
                ally_id = ally_id.match(/allianceId\=(.*)/);
                ally_id = ally_id[1];
            } else if (ally) {
                ally_id = XtenseMetas.getAllyId();
            }
            var points = Xpath.getStringValue(document, paths.points, row).trimInt();
            if (type[0] === 'player') {
                var name = Xpath.getStringValue(document, paths.player.playername, row).trim();
                var player_id = Xpath.getStringValue(document, paths.player.player_id, row).trim();
                if (player_id !== '') {
                    player_id = player_id.match(/\&to\=(.*)\&ajax/);
                    player_id = player_id[1];
                } else if (document.cookie.match(/login_(.*)=U_/))
                    player_id = document.cookie.match(/login_(.*)=U_/)[1];
                /*Nombre de vaisseaux*/
                if (type[1] === 'fleet') {
                    var NbVaisseaux = Xpath.getStringValue(document, paths.player.spacecraft, row).trimInt();
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
            } else if (type[0] === 'ally') {
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

        if (GM_getValue('lastAction', '') !== 'r:' + type[0] + ':' + type[1] + ':' + offset) { //TODO Eviter de parser les classements pour rien...
            setStatus(XLOG_NORMAL, Xl('ranking_detected'));
            GM_setValue('lastAction', 'r:' + type[0] + ':' + type[1] + ':' + offset);
            if (offset !== 0 && length !== 0) {
                XtenseRequest.set({
                    n: rowsData,
                    type: 'ranking',
                    offset: offset,
                    type1: type[0],
                    type2: type[1],
                    type3: type[2],
                    time: time
                });
                XtenseRequest.set('og_lang', langUnivers);
                XtenseRequest.send();
            }
        }
    }
}
//Fin Fonction
/* Page Overview */

function parse_overview() {
    setStatus(XLOG_NORMAL, Xl('overview_detected'));
    // Supression du setinterval si il existe
    if (typeof (delaytodisplay_overview) !== 'undefined') {
        clearInterval(delaytodisplay_overview);
    }

    var temperatures = Xpath.getStringValue(document, XtenseXpaths.overview.temperatures);
    if ((temperatures != null) && (temperatures !== '') && (temperatures.indexOf('_') === -1)) {
        var planetData = getPlanetData();
        if (GM_getValue('lastAction', '') !== 'planet_name:' + planetData.planet_name) {
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
            XtenseRequest.set('og_lang', langUnivers);
            XtenseRequest.send();
            GM_setValue('lastAction', 'planet_name:' + planetData.planet_name);
        }
    } else {
        log('Temperature Content is not there! Retrying...');
        delaytodisplay_overview = setInterval(parse_overview, 250);
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
            if (level !== '') {
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
            if (level !== '') {
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
            if (level !== '') {
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
}
/* Page Shipyard */

function parse_shipyard() {
    setStatus(XLOG_NORMAL, Xl('shipyard_detected'));
    var paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'fleet');
    var levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    var tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (var lvl = 0; lvl < levels.snapshotLength; lvl++) {
            var level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
            if (level !== '') {
                tabLevel.push(level);
            }
        }
    }
    var req = {
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
        'SE': tabLevel[12],
        'SAT': tabLevel[13]
    };
    XtenseRequest.set(getPlanetData());
    XtenseRequest.set(req);
    XtenseRequest.send();
}
/* Page Fleet */

function parse_fleet() {
    setStatus(XLOG_NORMAL, Xl('fleet_detected'));
    var paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'fleet');
    var levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    var tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (var lvl = 0; lvl < levels.snapshotLength; lvl++) {
            var level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
            if (level !== '') {
                tabLevel.push(level);
            }
        }
    }
    var req = {
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
            if (level !== '') {
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


/*********************** Utilities Ogame ********************************/
/* Recuperation des données de la planète */

function getPlanetData() {
    var planet_type = '';
    if (XtenseMetas.getPlanetType() === 'moon') {
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
    return XtenseMetas.getPlanetType() === 'moon';
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
