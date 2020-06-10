/*eslint-env es6*/
/*eslint no-undef: "error"*/
/*eslint-env browser*/
/*global log*/

/************************ PARSING DES PAGES  ***************************/

/* Fonction appelée lors d'évenement sur le chargement du contenu galaxie */

function parse_galaxy_system_inserted(event) {
    log.debug('In parse_galaxy_system_inserted()');
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
    //log.info("lastAction : "+GM_getValue(prefix_GMData +'lastAction',''));
    if (storageGetValue('lastAction', '') !== 's:' + galaxy + ':' + system) {
        let coords = [
            galaxy,
            system
        ];
        if (isNaN(coords[0]) || isNaN(coords[1])) {
            log.info('invalid system' + ' ' + coords[0] + ' ' + coords[1]);
            return;
        }
        setStatus(XLOG_NORMAL, xlang('system_detected') + "(" + coords[0] + ":" + coords[1] + ")");
        if (rows.snapshotLength > 0) {
            log.debug(rows.snapshotLength + ' rows found in galaxy');
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
                            log.debug('row ' + (i + 1) + ' has no player name');
                            continue;
                        } else
                            player = player2;
                    }
                } else
                    player = player_tooltip;
                if (name_tooltip === '') {
                    if (name === '') {
                        if (name_l === '') {
                            log.debug('row ' + (i + 1) + ' has no planet name');
                            continue;
                        } else
                            name = name_l;
                    }
                } else {
                    name = name_tooltip;
                }

                let position = Xpath.getNumberValue(document, paths.position, row);
                if (isNaN(position)) {
                    log.debug('position ' + position + ' is not a number');
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
                    debris[XtenseDatabase.debris[701 + j]] = 0;
                }
                let debrisCells = Xpath.getUnorderedSnapshotNodes(document, paths.debris, row);
                for (let j = 0; j < debrisCells.snapshotLength; j++) {
                    debris[XtenseDatabase.debris[701 + j]] = debrisCells.snapshotItem(j).innerHTML.trimInt();
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
                    log.debug('Ally id' + allyid);
                } else {
                    allyid = '0';
                }
                let planet_id = Xpath.getStringValue(document, paths.planet_id, row).trim();
                let moon_id = Xpath.getStringValue(document, paths.moon_id, row).trim();
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
                    debris: { metal : debris[XtenseDatabase.debris[701]] , cristal :debris[XtenseDatabase.debris[702]] },
                    activity: activity,
                    activityMoon: activityMoon
                };
                log.debug('row ' + position + ' > player_id:' + player_id + ',planet_name:' + name + ',planet_id:' + planet_id + ',moon_id:' + moon_id + ',moon:' + moon + ',player_name:' + player + ',status:' + status + ',ally_id:' + allyid + ',ally_tag:' + allytag + ',debris:(' + debris[XtenseDatabase.resources[601]] + '/' + debris[XtenseDatabase.resources[602]] + '),activity:' + activity + ',activity_moon:' + activityMoon);
            }

            /* Traitement Spécifique Profondeur de l'espace */

            let debris = [];
            debris[XtenseDatabase.debris[701]] = Xpath.getStringValue(document, paths.debris16_m).trimInt();
            debris[XtenseDatabase.debris[702]] = Xpath.getStringValue(document, paths.debris16_c).trimInt();

            if (debris[XtenseDatabase.resources[601]] !== '' || debris[XtenseDatabase.resources[602]] !== '') {

                let position = 16;
                rowsData[position] = {
                    player_id: '',
                    planet_name: 'Black Hole',
                    planet_id: '',
                    moon_id: '',
                    moon: 0,
                    player_name: 'Lost in space',
                    status: '',
                    ally_id: '',
                    ally_tag: '',
                    debris: { metal : debris[XtenseDatabase.debris[701]] , cristal :debris[XtenseDatabase.debris[702]] },
                    activity: '',
                    activityMoon: ''
                };
                log.debug('row ' + position + ' debris:(' + debris[XtenseDatabase.debris[701]] + '/' + debris[XtenseDatabase.debris[702]] + ')');

            }

            /* Envoi */
            XtenseRequest.set('type','system');
            XtenseRequest.set('gamedata',{
                rows: rowsData,
                galaxy: coords[0],
                system: coords[1]

            });

            XtenseRequest.send();
            storageSetValue('lastAction', 's:' + coords[0] + ':' + coords[1]);
        }
    }
}

/* Fonction appelée lors d'évenement sur le chargement de la page d'alliance */

function parse_ally_inserted() {
    //log.info("last_action="+GM_getValue(prefix_GMData +'lastAction',''));
    if (storageGetValue('lastAction', '') !== 'ally_list') {
        setStatus(XLOG_NORMAL, xlang('ally_list_detected'));
        let paths = XtenseXpaths.ally_members_list;
        let rows = Xpath.getOrderedSnapshotNodes(document, paths.rows);
        let rowsData = [];
        log.info(rows.snapshotLength + ' membres à envoyer !');

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
            log.info("Player: " + rowsData[i].player + " Points: " + rowsData[i].points + " Coords: " + rowsData[i].coords + " Rank: " + rowsData[i].rank);
        }
        if (rowsData.length > 0) {
            let tag = Xpath.getStringValue(document, paths.tag);
            XtenseRequest.set('type','ally_list');
            XtenseRequest.set('gamedata',{
                allyList: rowsData,
                tag: tag
            });
            XtenseRequest.send();
            storageSetValue('lastAction', 'ally_list');
        }
        get_ally_content(); // Pourquoi celui-ci est fait à l'envers par rapport aux autres ?
    }
}

/* Fonction appelée lors d'évenement sur le chargement des classements */

function parse_ranking_inserted(event) {
    log.info('Rankings Detected');
    let paths = XtenseXpaths.ranking;
    let rows = Xpath.getOrderedSnapshotNodes(document, paths.rows, null);
    if (rows.snapshotLength > 0) {
        log.debug(rows.snapshotLength + ' Lignes à envoyer');
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
        log.debug('time:' + time + ',type1:' + type[0] + ',type2:' + type[1] + ',type3: ' + type[2] + ',nombreLignes:' + rows.snapshotLength);
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
                if (player_id === '') {
                    player_id = XtenseMetas.getPlayerId();
                }
                /*Nombre de vaisseaux*/
                if (type[1] === 'fleet') {
                    let NbVaisseaux = Xpath.getStringValue(document, paths.player.spacecraft, row).trimInt();
                    log.debug('row ' + n + ' > player_id:' + player_id + ',player_name:' + name + ',ally_id:' + ally_id + ',ally_tag:' + ally + ',points:' + points + ',NbVaisseaux:' + NbVaisseaux);
                    data_row = {
                        rank: n,
                        player_id: player_id,
                        player_name: name,
                        ally_id: ally_id,
                        ally_tag: ally,
                        points: points,
                        nb_spacecraft: NbVaisseaux
                    };
                } else {
                    log.debug('row ' + n + ' > player_id:' + player_id + ',player_name:' + name + ',ally_id:' + ally_id + ',ally_tag:' + ally + ',points:' + points);
                    data_row = {
                        rank: n,
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
                log.debug('position ' + n + ' > allyid:' + rank_ally_allyid + ',allytag:' + rank_ally_allytag + ',members:' + members + ',points:' + points + ',mean:' + moy);
                data_row = {
                    rank: n,
                    ally_id: rank_ally_allyid,
                    ally_tag: rank_ally_allytag,
                    members: members,
                    points: points,
                    mean: moy
                };
            }
            rowsData.push(data_row);
            length++;
        }

        if (storageGetValue('lastAction', '') !== 'r:' + type[0] + ':' + type[1] + ':' + offset) { //TODO Eviter de parser les classements pour rien...
            //setStatus(XLOG_NORMAL, Xl('ranking_detected'));
            storageSetValue('lastAction', 'r:' + type[0] + ':' + type[1] + ':' + offset);
            if (offset !== 0 && length !== 0) {
                XtenseRequest.set('type','ranking');
                XtenseRequest.set('gamedata',{
                    n: rowsData,
                    offset: offset,
                    type1: type[0],
                    type2: type[1],
                    type3: type[2],
                    time: time
                });
                XtenseRequest.send();
            }
        }
    }
}

//Fin Fonction
/* Page Overview */

function parse_overview() {

    // Supression du setinterval si il existe
    if (typeof (delaytodisplay_overview) !== 'undefined') {
        clearInterval(delaytodisplay_overview);
    }

    let temperatures = Xpath.getStringValue(document, XtenseXpaths.overview.temperatures);
    if ((temperatures != null) && (temperatures !== '') && (temperatures.indexOf('_') === -1)) {
        setStatus(XLOG_NORMAL, xlang('overview_detected'));
        let planetData = getPlanetData();
        if (storageGetValue('lastAction', '') !== 'planet_name:' + planetData.planet_name) {
            let cases = Xpath.getStringValue(document, XtenseXpaths.overview.cases).trimInt();
            let temperature_max = temperatures.match(/\d+[^\d-]*(-?\d+)[^\d]/)[1];
            let temperature_min = temperatures.match(/(-?\d+)/)[1];
            let resources = getResources();
            let playerdetails = getPlayerDetails();
            let unidetails = getUniverseDetails();
            // retreive boosters and extensions
            let planetBoostersAndExtensions = getPlanetBoostersAndExtensions();

            XtenseRequest.set('type', 'overview');
            XtenseRequest.set('gamedata', {
                planetName: planetData.planet_name,
                coords: planetData.coords,
                planetType: planetData.planet_type,
                fields: cases,
                temperature_min: temperature_min,
                temperature_max: temperature_max,
                ressources: resources,
                playerdetails: playerdetails,
                unidetails: unidetails,
                boosters: planetBoostersAndExtensions
            });
            XtenseRequest.send();
            storageSetValue('lastAction', 'planet_name:' + planetData.planet_name);
        }
    } else {
        log.trace('Temperature Content is not there! Retrying...');
        delaytodisplay_overview = setInterval(parse_overview, 500);
        // Necessaire car la page est remplie par des scripts JS. (Au premier passage les balises contenant les infomations sont vides)
    }
}

/* Page Buildings */

function parse_buildings() {
    setStatus(XLOG_NORMAL, xlang('buildings_detected'));
    let paths = XtenseXpaths.levels;

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
    let planetData = getPlanetData();
    let send;

    if ( isMoon() === true) {
        send = {
            'M': tabLevel[0],
            'C': tabLevel[1],
            'D': tabLevel[2],
            'CES': tabLevel[3],
            'CEF': tabLevel[4],
            'SAT': tabLevel[5],
            'HM': tabLevel[6],
            'HC': tabLevel[7],
            'HD': tabLevel[8]
        };
    } else {
        send = {
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
        };
    }
    XtenseRequest.set('gamedata', {
        planetName : planetData.planet_name,
        coords : planetData.coords,
        planetType : planetData.planet_type,
        buildings : send
    });
    XtenseRequest.set('type', 'buildings');
    XtenseRequest.send();
}

/* Page Stations */

function parse_station() {
    setStatus(XLOG_NORMAL, xlang('installations_detected'));
    let paths = XtenseXpaths.levels;

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
    let planetData = getPlanetData();
    let send;

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
    XtenseRequest.set('type', 'buildings');
    XtenseRequest.set('gamedata', {
        planetName : planetData.planet_name,
        coords : planetData.coords,
        planetType : planetData.planet_type,
        buildings : send
    });
    XtenseRequest.send();
}

/* Page Researchs */

function parse_researchs() {
    setStatus(XLOG_NORMAL, xlang('researchs_detected'));
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

    let planetData = getPlanetData();

    send = {
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
    };

    XtenseRequest.set('type', 'researchs');
    XtenseRequest.set('gamedata', {
        planetName : planetData.planet_name,
        coords : planetData.coords,
        planetType : planetData.planet_type,
        researchs : send
    });
    XtenseRequest.send();
}

/* Page Shipyard */

function parse_shipyard() {
    setStatus(XLOG_NORMAL, xlang('shipyard_detected'));
    let paths = XtenseXpaths.levels;

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
    let planetData = getPlanetData();
    let send = {
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
    XtenseRequest.set('type', 'fleet');
    XtenseRequest.set('gamedata', {
        planetName : planetData.planet_name,
        coords : planetData.coords,
        planetType : planetData.planet_type,
        fleet : send
    });
    XtenseRequest.send();
}

/* Page Fleet */

function parse_fleet() {
    setStatus(XLOG_NORMAL, xlang('fleet_detected'));
    let paths = XtenseXpaths.levels;

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
    let planetData = getPlanetData();
    let send = {
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
    XtenseRequest.set('type', 'fleet');
    XtenseRequest.set('gamedata', {
        planetName : planetData.planet_name,
        coords : planetData.coords,
        planetType : planetData.planet_type,
        fleet : send
    });
    XtenseRequest.send();
}

/* Page Defense */

function parse_defense() {
    setStatus(XLOG_NORMAL, xlang('defense_detected'));
    let paths = XtenseXpaths.levels;

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

    let planetData = getPlanetData();
    send = {
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
    };
    XtenseRequest.set('type', 'defense');
    XtenseRequest.set('gamedata', {
        planetName : planetData.planet_name,
        coords : planetData.coords,
        planetType : planetData.planet_type,
        defense : send
    });

    XtenseRequest.send();
}


/*********************** Utilities Ogame ********************************/



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

    return datas;
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
    storageSetValue('my.planets', pls);
}

// Récupération des ressources d'une planète

function getResources() {
    let metal = Xpath.getStringValue(document, XtenseXpaths.ressources.metal).trimInt();
    let cristal = Xpath.getStringValue(document, XtenseXpaths.ressources.cristal).trimInt();
    let deut = Xpath.getStringValue(document, XtenseXpaths.ressources.deuterium).trimInt();
    let antimater = Xpath.getStringValue(document, XtenseXpaths.ressources.antimatiere).trimInt();
    let energy = Xpath.getStringValue(document, XtenseXpaths.ressources.energie).trimInt();

    log.debug('metal=' + metal + ', crystal=' + cristal + ', deuterium=' + deut + ', antimatiere=' + antimater + ', energie=' + energy);
    return { "metal" : metal,
        "cristal" : cristal,
        "deut" : deut,
        "antimater" : antimater,
        "energy" : energy};
}
