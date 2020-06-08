/*eslint-env es6*/
/*eslint no-undef: "error"*/
/*eslint-env browser*/
/*global log*/

/* Recuperation des données de la planète */

/* Fonctions permettant de récupérer les données des balises metas */

XtenseMetas = {
    getOgameVersion: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.ogame_version);
    },
    getTimestamp: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.timestamp);
    },
    getUniverse: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.universe);
    },
    getUniversename: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.universename);
    },
    getUniversespeed: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.universespeed);
    },
    getuniversespeedfleet: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.universespeedfleet);
    },
    getLanguage: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.language);
    },
    getdonutgalaxy: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.donutgalaxy);
    },
    getdonutsystem: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.donutsystem);
    },
    getPlayerId: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.player_id);
    },
    getPlayerName: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.player_name);
    },
    getAllyId: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.ally_id);
    },
    getAllyName: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.ally_name);
    },
    getAllyTag: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.ally_tag);
    },
    getPlanetId: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.planet_id);
    },
    getPlanetName: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.planet_name);
    },
    getPlanetCoords: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.planet_coords);
    },
    getPlanetType: function () {
        return Xpath.getStringValue(document, XtenseXpaths.metas.planet_type);
    }
};

function getPlanetData() {
    let planet_type = '';
    if (XtenseMetas.getPlanetType() === 'moon') {
        planet_type = '1';
    } else {
        planet_type = '0';
    }
    //log.info("planet_name: "+XtenseMetas.getPlanetName()+", coords : "+XtenseMetas.getPlanetCoords()+", planet_type : "+planet_type);

    return {
        planet_name: XtenseMetas.getPlanetName(),
        coords: XtenseMetas.getPlanetCoords(),
        planet_type: planet_type
    };
}

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

    log.debug('player_pseudo=' + player_pseudo + ',' +
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



    log.debug('uni_version=' + uni_version + ',' +
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
