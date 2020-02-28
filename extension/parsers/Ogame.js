/**
 * Created by Anthony on 13/12/2015.
 */

/*eslint-env es6*/

function handle_current_page() {
    // Expressions régulières des pages
    let regGalaxy;
    regGalaxy = new RegExp(/component=(galaxy)/);
    let regOverview = new RegExp(/component=(overview)/);
    let regOption = new RegExp(/(xtense=Options)/);
    let regResearch = new RegExp(/component=(research)/);
    let regBuildings = new RegExp(/component=(supplies)/);
    let regStation = new RegExp(/component=(facilities)/);
    let regShipyard = new RegExp(/component=(shipyard)/);
    let regFleet1 = new RegExp(/component=(fleetdispatch)/);
    let regDefense = new RegExp(/component=(defenses)/);
    let regMessages = new RegExp(/page=(messages)/);
    let regAlliance = new RegExp(/page=(alliance)/);
    let regStats = new RegExp(/page=(highscore)/);

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
    let rights = page;
    if(page === 'fleet')
        rights = 'shipyard';

    if(GM_getValue('handle.'.concat(rights), 'false').toString() === 'true' || GM_getValue('manual.send', 'false').toString() === 'true')
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
function get_content(type) {
    let elementName;
    let func;
    switch (type) {
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

    if (elementName != null) {
        let target = document.getElementById(elementName);
        //console.log(document.body.serializeWithStyles());
        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                //log('Mutation Observer : ' + mutation.addedNodes);
                func();
            });
        });
        // configuration of the observer:
        let config = {attributes: true, childList: true, characterData: true};
        observer.observe(target, config);
    }

    //log('Static Observer : ' + 'Running ' + type);
    func();
}

/* Fonction ajoutant lancant le parsing de la vue alliance quand celle-ci est chargée */

function get_ally_content() {

    let target = document.getElementById('inhalt');
    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            parse_ally_inserted();
        });
    });
    let config = {attributes: true, childList: true, characterData: true};
    observer.observe(target, config);
}

/* Fonction ajoutant lancant le parsing de la vue classement quand celle-ci est chargée */

function get_message_content() {
    //Sur navigation onglets
    //$('#buttonz').click(function(){ parse_messages(); }); //Spy reports list

    //Sur affichage Message long
    let target = document.getElementById('messages');
    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length === 0)
                return;
            let node = mutation.addedNodes[0];
            switch (node.id) {
                case  'fleetsgenericpage':
                case 'communicationmessagespage':
                case 'defaultmessagespage':
                    break;
                default:
                    if (node.className !== 'pagination')
                        return;
            }

            log('Mutation Message');
            parse_messages();
        });
    });
    let config = {attributes: false, childList: true, characterData: false, subtree: true};
    observer.observe(target, config);

    parse_messages(); // Première Page

}

/************************ PARSING DES PAGES  ***************************/

/* Fonction appelée lors d'évenement sur le chargement du contenu galaxie */

function parse_galaxy_system_inserted(event) {
    log('In parse_galaxy_system_inserted()');
    //var doc = event.target.ownerDocument;
    let paths = XtenseXpaths.galaxy;
    //Référence Xpaths
    let galaxyInput = Xpath.getSingleNode(document, paths.galaxy_input);
    if (galaxyInput === null)
        return;
    let galaxy = galaxyInput.value.trim();
    //Récupération Galaxie
    let system = Xpath.getSingleNode(document, paths.system_input).value.trim();
    //Récupération SS
    let rows = Xpath.getUnorderedSnapshotNodes(document, paths.rows);
    //log("lastAction : "+GM_getValue(prefix_GMData +'lastAction',''));
    if (GM_getValue('lastAction', '') !== 's:' + galaxy + ':' + system) {
        let coords = [
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
            let rowsData = [];
            for (let i = 0; i < rows.snapshotLength; i++) {
                let row = rows.snapshotItem(i);
                let name = Xpath.getStringValue(document, paths.planetname, row).trim().replace(/\($/, '');
                let name_l = Xpath.getStringValue(document, paths.planetname_1, row).trim().replace(/\($/, '');
                let name_tooltip = Xpath.getStringValue(document, paths.planetname_tooltip, row).trim().replace(/\($/, '');
                let player = Xpath.getStringValue(document, paths.playername, row).trim();
                let player2 = Xpath.getStringValue(document, paths.playername2, row).trim();
                let player_tooltip = Xpath.getStringValue(document, paths.playername_tooltip, row).trim();
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
                } else {
                    name = name_tooltip;
                }
                //var position = i+1;
                let position = Xpath.getNumberValue(document, paths.position, row);
                if (isNaN(position)) {
                    log('position ' + position + ' is not a number');
                    continue;
                }
                let moon = Xpath.getUnorderedSnapshotNodes(document, paths.moon, row);
                moon = moon.snapshotLength > 0 ? 1 : 0;
                let statusNodes = Xpath.getUnorderedSnapshotNodes(document, paths.status, row);
                let status = '';
                if (statusNodes.snapshotLength > 0) {
                    for (let j = 0; j < statusNodes.snapshotLength; j++) {
                        status += statusNodes.snapshotItem(j).textContent.trim();
                    }
                } else {
                    status = '';
                }
                let banned = Xpath.getStringValue(document, paths.status_baned, row).trim();
                status = banned + status;
                let activity = Xpath.getStringValue(document, paths.activity, row).trim();
                if (!activity) {
                    activity = (Xpath.getStringValue(document, paths.activity15, row) ? 0 : -1);
                    //If contains 'minutes15' in class
                }
                let activityMoon = Xpath.getStringValue(document, paths.activity_m, row).trim();
                if (!activityMoon) {
                    activityMoon = (Xpath.getStringValue(document, paths.activity15_m, row) ? 0 : -1);
                    //If contains 'minutes15' in class
                }
                let allytag = Xpath.getStringValue(document, paths.allytag, row).trim();
                let debris = [];
                for (let j = 0; j < 2; j++) {
                    debris[XtenseDatabase.resources[601 + j]] = 0;
                }
                let debrisCells = Xpath.getUnorderedSnapshotNodes(document, paths.debris, row);
                for (let j = 0; j < debrisCells.snapshotLength; j++) {
                    debris[XtenseDatabase.resources[601 + j]] = debrisCells.snapshotItem(j).innerHTML.trimInt();
                }
                let player_id = Xpath.getStringValue(document, paths.player_id, row).trim();
                if (player_id !== '') {
                    player_id = player_id.trimInt();
                } else if (player) {
                    player_id = XtenseMetas.getPlayerId();
                }
                let allyid = Xpath.getStringValue(document, paths.ally_id, row).trim();
                if (allyid !== '') {
                    allyid = allyid.trimInt();
                    log('Ally id' + allyid);
                } else {
                    allyid = '0';
                }
                let planet_id = Xpath.getStringValue(document, paths.planet_id, row).trim();
                let moon_id = Xpath.getStringValue(document, paths.moon_id, row).trim();
                log('row ' + position + ' > player_id:' + player_id + ',planet_name:' + name + ',planet_id:' + planet_id + ',moon_id:' + moon_id + ',moon:' + moon + ',player_name:' + player + ',status:' + status + ',ally_id:' + allyid + ',ally_tag:' + allytag + ',debris:(' + debris[XtenseDatabase.resources[601]] + '/' + debris[XtenseDatabase.resources[602]] + '),activity:' + activity + ',activity_moon:' + activityMoon);
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
        let paths = XtenseXpaths.ally_members_list;
        let rows = Xpath.getOrderedSnapshotNodes(document, paths.rows);
        let rowsData = [];
        log(rows.snapshotLength + ' membres à envoyer !');

        for (let i = 0; i < rows.snapshotLength; i++) {
            let row = rows.snapshotItem(i);
            let player = Xpath.getStringValue(document, paths.player, row).trim();
            let points = Xpath.getStringValue(document, paths.points, row).trimInt();
            let rank = Xpath.getStringValue(document, paths.rank, row).trimInt();
            let coords = Xpath.getStringValue(document, paths.coords, row).trim();
            coords = coords.match(new RegExp(XtenseRegexps.coords))[0];
            rowsData[i] = {
                player: player,
                points: points,
                coords: coords,
                rank: rank
            };
            log("Player: " + rowsData[i].player + " Points: " + rowsData[i].points + " Coords: " + rowsData[i].coords + " Rank: " + rowsData[i].rank);
        }
        if (rowsData.length > 0) {
            let tag = Xpath.getStringValue(document, paths.tag);
            XtenseRequest.set({
                n: rowsData,
                type: 'ally_list',
                tag: tag
            });
            XtenseRequest.set('og_lang', langUnivers);
            XtenseRequest.send();
            GM_setValue('lastAction', 'ally_list');
        }
        get_ally_content(); // Pourquoi celui-ci est fait à l'envers par rapport aux autres ?
    }
}

/* Fonction appelée lors d'évenement sur le chargement des classements */

function parse_ranking_inserted(event) {
    log('Entering parse_ranking_inserted');
    let paths = XtenseXpaths.ranking;
    let rows = Xpath.getOrderedSnapshotNodes(document, paths.rows, null);
    if (rows.snapshotLength > 0) {
        //Récupération de la date courante du jeu
        let timeText = Xpath.getStringValue(document, paths.time).trim();
        timeText = timeText.match(/(\d+).(\d+).(\d+)[^\d]+(\d+):\d+:\d+/);
        //Conversion dans la plage de 8 (0-8-16)
        let time = new Date();
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
        let type = [];
        type[0] = Xpath.getStringValue(document, paths.who);
        type[1] = Xpath.getStringValue(document, paths.type);
        type[2] = Xpath.getStringValue(document, paths.subnav_fleet);
        type[0] = (type[0] !== '') ? type[0] : 'player';
        type[0] = (type[0] === 'alliance') ? 'ally' : type[0];
        type[1] = (type[1] !== '') ? type[1] : 'points';
        let length = 0;
        //var rows = Xpath.getOrderedSnapshotNodes(document,paths.rows,null);
        let offset = 0;
        log('time:' + time + ',type1:' + type[0] + ',type2:' + type[1] + ',type3: ' + type[2] + ',nombreLignes:' + rows.snapshotLength);
        //if(rows.snapshotLength > 0){ //Double sécurité
        let rowsData = [];
        for (let i = 0; i < rows.snapshotLength; i++) {
            let row = rows.snapshotItem(i);
            let data_row; //Initialize Row Data
            let n = Xpath.getStringValue(document, paths.position, row).trimInt();
            if (i === 1) {
                offset = Math.floor(n / 100) * 100 + 1;
                //parce que le nouveau classement ne commence pas toujours pile a la centaine et OGSpy toujours a 101,201...
            }
            let points = Xpath.getStringValue(document, paths.points, row).trimInt();
            if (type[0] === 'player') {

                let ally = Xpath.getStringValue(document, paths.allytag, row).trim().replace(/\]|\[/g, '');
                let ally_id = Xpath.getStringValue(document, paths.ally_id, row).trim();

                if (ally_id !== '' && !ally_id.match(/page\=alliance/)) {
                    //Pas d'id sur le lien de sa propre alliance (dans les classements alliances)
                    ally_id = ally_id.match(/allianceId\=(.*)/);
                    ally_id = ally_id[1];
                } else if (ally) {
                    ally_id = XtenseMetas.getAllyId();
                }

                let name = Xpath.getStringValue(document, paths.player.playername, row).trim();
                let player_id = Xpath.getStringValue(document, paths.player.player_id, row).trim();
                if (player_id !== '') {
                    player_id = player_id.match(/\&to\=(.*)\&ajax/);
                    player_id = player_id[1];
                } else if (document.cookie.match(/login_(.*)=U_/))
                    player_id = document.cookie.match(/login_(.*)=U_/)[1];
                /*Nombre de vaisseaux*/
                if (type[1] === 'fleet') {
                    let NbVaisseaux = Xpath.getStringValue(document, paths.player.spacecraft, row).trimInt();
                    log('row ' + n + ' > player_id:' + player_id + ',player_name:' + name + ',ally_id:' + ally_id + ',ally_tag:' + ally + ',points:' + points + ',NbVaisseaux:' + NbVaisseaux);
                    data_row = {
                        player_id: player_id,
                        player_name: name,
                        ally_id: ally_id,
                        ally_tag: ally,
                        points: points,
                        nb_spacecraft: NbVaisseaux
                    };
                } else {
                    log('row ' + n + ' > player_id:' + player_id + ',player_name:' + name + ',ally_id:' + ally_id + ',ally_tag:' + ally + ',points:' + points);
                    data_row = {
                        player_id: player_id,
                        player_name: name,
                        ally_id: ally_id,
                        ally_tag: ally,
                        points: points
                    };
                }
            } else if (type[0] === 'ally') {
                let members = Xpath.getStringValue(document, paths.ally.members, row).trimInt();
                let moy = Xpath.getStringValue(document, paths.ally.points_moy, row).replace('|.', '').trimInt();
                let rank_ally_allytag = Xpath.getStringValue(document, paths.ally.allytag, row).trim().replace(/\]|\[/g, '');
                let rank_ally_url = Xpath.getStringValue(document, paths.ally.ally_id, row).trim();
                let rank_ally_allyid = -1;
                if (rank_ally_url !== 'undefined' ) {
                    //Affiché sous forme de lien vers page alliance
                    if(rank_ally_url.match(/allianceId\=(.*)/)) {
                        rank_ally_allyid = rank_ally_url.match(/allianceId\=(.*)/)[1];
                    }else // Car lien vers sa propre page ally
                    {
                        rank_ally_allyid = XtenseMetas.getAllyId();
                    }
                }
                log('position ' + n + ' > allyid:' + rank_ally_allyid + ',allytag:' + rank_ally_allytag + ',members:' + members + ',points:' + points + ',mean:' + moy);
                data_row = {
                    ally_id: rank_ally_allyid,
                    ally_tag: rank_ally_allytag,
                    members: members,
                    points: points,
                    mean: moy
                };
            }
            rowsData[n] = data_row;
            length++;
        }

        if (GM_getValue('lastAction', '') !== 'r:' + type[0] + ':' + type[1] + ':' + offset) { //TODO Eviter de parser les classements pour rien...
            //setStatus(XLOG_NORMAL, Xl('ranking_detected'));
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

    let temperatures = Xpath.getStringValue(document, XtenseXpaths.overview.temperatures);
    if ((temperatures != null) && (temperatures !== '') && (temperatures.indexOf('_') === -1)) {
        let planetData = getPlanetData();
        if (GM_getValue('lastAction', '') !== 'planet_name:' + planetData.planet_name) {
            let cases = Xpath.getStringValue(document, XtenseXpaths.overview.cases).trimInt();
            let temperature_max = temperatures.match(/\d+[^\d-]*(-?\d+)[^\d]/)[1];
            let temperature_min = temperatures.match(/(-?\d+)/)[1];
            let resources = getResources();
            let playerdetails = getPlayerDetails();
            let unidetails = getUniverseDetails();
            // retreive boosters and extensions
            let planetBoostersAndExtensions = getPlanetBoostersAndExtensions();

            XtenseRequest.set({
                type: 'overview',
                fields: cases,
                temperature_min: temperature_min,
                temperature_max: temperature_max,
                ressources: resources,
                playerdetails : playerdetails,
                unidetails : unidetails
            }, planetData, planetBoostersAndExtensions);
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
    let paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'buildings');
    let levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    let tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (let lvl = 0; lvl < levels.snapshotLength; lvl++) {
            let level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
            if (level !== '') {
                tabLevel.push(level);
            }
        }
    }
    XtenseRequest.set(getPlanetData());
if ( isMoon() === true) {
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
} else {
    XtenseRequest.set({
        'M': tabLevel[0],
        'C': tabLevel[1],
        'D': tabLevel[2],
        'CES': tabLevel[3],
        'CEF': tabLevel[4],
        'SAT': tabLevel[5],
        'FOR': tabLevel[6],
        'HM': tabLevel[7],
        'HC': tabLevel[8],
        'HD': tabLevel[9]
    });
}


    XtenseRequest.send();
}

/* Page Stations */

function parse_station() {
    setStatus(XLOG_NORMAL, Xl('installations_detected'));
    let paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'buildings');
    let levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    let tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (let lvl = 0; lvl < levels.snapshotLength; lvl++) {
            let level = levels.snapshotItem(lvl).nodeValue.trim();
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
            'Ter': tabLevel[6],
            'Dock': tabLevel[7]
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
    let levels = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.levels.level, null);
    let tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (let lvl = 0; lvl < levels.snapshotLength; lvl++) {
            let level = levels.snapshotItem(lvl).nodeValue.trim();
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
    let paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'fleet');
    let levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    let tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (let lvl = 0; lvl < levels.snapshotLength; lvl++) {
            let level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
            if (level !== '') {
                tabLevel.push(level);
            }
        }
    }
    let req = {
        'CLE': tabLevel[0],
        'CLO': tabLevel[1],
        'CR': tabLevel[2],
        'VB': tabLevel[3],
        'TRA': tabLevel[4],
        'BMD': tabLevel[5],
        'DST': tabLevel[6],
        'EDLM': tabLevel[7],
        'FAU': tabLevel[8],
        'ECL': tabLevel[9],
        'PT': tabLevel[10],
        'GT': tabLevel[11],
        'VC': tabLevel[12],
        'REC': tabLevel[13],
        'SE': tabLevel[14],
        'SAT': tabLevel[15],
        'FOR': tabLevel[16]
    };
    XtenseRequest.set(getPlanetData());
    XtenseRequest.set(req);
    XtenseRequest.send();
}

/* Page Fleet */

function parse_fleet() {
    setStatus(XLOG_NORMAL, Xl('fleet_detected'));
    let paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'fleet');
    let levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    let tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (let lvl = 0; lvl < levels.snapshotLength; lvl++) {
            let level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
            if (level !== '') {
                tabLevel.push(level);
            }
        }
    }
    let req = {
        'CLE': tabLevel[0],
        'CLO': tabLevel[1],
        'CR': tabLevel[2],
        'VB': tabLevel[3],
        'TRA': tabLevel[4],
        'BMD': tabLevel[5],
        'DST': tabLevel[6],
        'EDLM': tabLevel[7],
        'FAU': tabLevel[8],
        'ECL': tabLevel[9],
        'PT': tabLevel[10],
        'GT': tabLevel[11],
        'VC': tabLevel[12],
        'REC': tabLevel[13],
        'SE': tabLevel[14]

    };
    XtenseRequest.set(getPlanetData());
    XtenseRequest.set(req);
    XtenseRequest.send();
}

/* Page Defense */

function parse_defense() {
    setStatus(XLOG_NORMAL, Xl('defense_detected'));
    let paths = XtenseXpaths.levels;
    XtenseRequest.set('type', 'defense');
    let levels = Xpath.getOrderedSnapshotNodes(document, paths.level, null);
    let tabLevel = [];
    if (levels.snapshotLength > 0) {
        for (let lvl = 0; lvl < levels.snapshotLength; lvl++) {
            let level = levels.snapshotItem(lvl).nodeValue.trim().replace(/\./g, '');
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
    let planet_type = '';
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

    let items = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.boostersExtensions.items);

    let datas = Array();
    if (items != null && items.snapshotLength > 0) {
        for (let i = 0; i < items.snapshotLength; i++) {
            let item = items.snapshotItem(i);
            let uuid = Xpath.getStringValue(document, XtenseXpaths.boostersExtensions.dataUuid, item);
            let title = Xpath.getStringValue(document, XtenseXpaths.boostersExtensions.itemTime, item);
            let temps = "";

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
    let mesPlanetes = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.planetData.coords);
    let pls = '';
    if (mesPlanetes != null && mesPlanetes.snapshotLength > 0) {
        for (let i = 0; i < mesPlanetes.snapshotLength; i++) {
            pls += mesPlanetes.snapshotItem(i).textContent.trim() + ((i < (mesPlanetes.snapshotLength - 1)) ? ';' : '');
        }
    }
    GM_setValue('my.planets', pls);
}

// Récupération des ressources d'une planète

function getResources() {
    let metal = Xpath.getStringValue(document, XtenseXpaths.ressources.metal).trimInt();
    let cristal = Xpath.getStringValue(document, XtenseXpaths.ressources.cristal).trimInt();
    let deut = Xpath.getStringValue(document, XtenseXpaths.ressources.deuterium).trimInt();
    let antimater = Xpath.getStringValue(document, XtenseXpaths.ressources.antimatiere).trimInt();
    let energy = Xpath.getStringValue(document, XtenseXpaths.ressources.energie).trimInt();

    log('metal=' + metal + ', crystal=' + cristal + ', deuterium=' + deut + ', antimatiere=' + antimater + ', energie=' + energy);
    return { "metal" : metal,
             "cristal" : cristal,
             "deut" : deut,
             "antimater" : antimater,
             "energy" : energy};
}

//
function getPlayerDetails() {

    let player_pseudo = XtenseMetas.getPlayerName();
    let player_id = XtenseMetas.getPlayerId();

    let playerclass_explorer = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.playerData.playerclass_explorer).snapshotLength;
    let playerclass_miner = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.playerData.playerclass_miner).snapshotLength;
    let playerclass_warrior = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.playerData.playerclass_warrior).snapshotLength;

    let player_officer_commander = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.playerData.officer_commander).snapshotLength;
    let player_officer_amiral = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.playerData.officer_amiral).snapshotLength;
    let player_officer_engineer= Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.playerData.officer_engineer).snapshotLength;
    let player_officer_geologist = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.playerData.officer_geologist).snapshotLength;
    let player_officer_technocrate = Xpath.getOrderedSnapshotNodes(document, XtenseXpaths.playerData.officer_technocrate).snapshotLength;

    log('player_pseudo=' + player_pseudo + ',' +
        'player_id=' + player_id + ',' +
        'playerclass_explorer=' + playerclass_explorer + ',' +
        'playerclass_miner=' + playerclass_miner + ',' +
        'playerclass_warrior=' + playerclass_warrior + ',' +
        'player_officer_commander=' + player_officer_commander + ',' +
        'player_officer_amiral=' + player_officer_amiral + ',' +
        'player_officer_engineer=' + player_officer_engineer + ',' +
        'player_officer_geologist=' + player_officer_geologist + ',' +
        'player_officer_technocrate=' + player_officer_technocrate);

    return {"player_name" : player_pseudo,
            "player_id" : player_id,
            "playerclass_explorer": playerclass_explorer,
            "playerclass_miner" : playerclass_miner,
            "playerclass_warrior" : playerclass_warrior,
            "player_officer_commander" : player_officer_commander,
            "player_officer_amiral" : player_officer_amiral,
            "player_officer_engineer" : player_officer_engineer,
            "player_officer_geologist" : player_officer_geologist,
            "player_officer_technocrate" : player_officer_technocrate};
}

function getUniverseDetails() {

    let uni_version = XtenseMetas.getOgameVersion();
    let uni_url = XtenseMetas.getUniverse();
    let uni_lang = XtenseMetas.getLanguage();
    let uni_name = XtenseMetas.getUniversename();
    let uni_time = XtenseMetas.getTimestamp();
    let uni_speed = XtenseMetas.getUniversespeed();
    let uni_speed_fleet = XtenseMetas.getuniversespeedfleet();
    let uni_donut_g = XtenseMetas.getdonutgalaxy();
    let uni_donut_s = XtenseMetas.getdonutsystem();



    log('uni_version=' + uni_version + ',' +
        'uni_url=' + uni_url + ',' +
        'uni_lang=' + uni_lang + ',' +
        'uni_name=' + uni_name + ',' +
        'uni_time=' + uni_time + ',' +
        'uni_speed=' + uni_speed + ',' +
        'uni_speed_fleet=' + uni_speed_fleet + ',' +
        'uni_donut_g=' + uni_donut_g + ',' +
        'uni_donut_s=' + uni_donut_s);

    return {"uni_version" : uni_version,
        "uni_url" : uni_url,
        "uni_lang" : uni_lang,
        "uni_name" : uni_name,
        "uni_time" : uni_time,
        "uni_speed" : uni_speed,
        "uni_speed_fleet" : uni_speed_fleet,
        "uni_donut_g" : uni_donut_g,
        "uni_donut_s" : uni_donut_s};
}
