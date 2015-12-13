/**
 * @author OGSteam
 * @license GNU/GPL
 */
 
/**************** PARSERS & Communication OGSPY *************************/
/* Fonction permettant d'initialiser les Xpaths, les parsers Xpath et le parser des metasdonnées */

function initParsers() {
    /* Fonctions Xpaths */
    Xpath = {
        //node est facultatif
        getNumberValue: function (doc, xpath, node) {
            node = node ? node : doc;
            return doc.evaluate(xpath, node, null, XPathResult.NUMBER_TYPE, null).numberValue;
        },
        getStringValue: function (doc, xpath, node) {
            node = node ? node : doc;
            return doc.evaluate(xpath, node, null, XPathResult.STRING_TYPE, null).stringValue;
        },
        getOrderedSnapshotNodes: function (doc, xpath, node) {
            node = node ? node : doc;
            return doc.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        },
        getUnorderedSnapshotNodes: function (doc, xpath, node) {
            node = node ? node : doc;
            return doc.evaluate(xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        },
        getSingleNode: function (doc, xpath, node) {
            node = node ? node : doc;
            return doc.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }
    };
    XtenseXpaths = {
        metas: {
            ogame_version: '//meta[@name=\'ogame-version\']/@content',
            timestamp: '//meta[@name=\'ogame-timestamp\']/@content',
            universe: '//meta[@name=\'ogame-universe\']/@content',
            language: '//meta[@name=\'ogame-language\']/@content',
            player_id: '//meta[@name=\'ogame-player-id\']/@content',
            player_name: '//meta[@name=\'ogame-player-name\']/@content',
            ally_id: '//meta[@name=\'ogame-alliance-id\']/@content',
            ally_name: '//meta[@name=\'ogame-alliance-name\']/@content',
            ally_tag: '//meta[@name=\'ogame-alliance-tag\']/@content',
            planet_id: '//meta[@name=\'ogame-planet-id\']/@content',
            planet_name: '//meta[@name=\'ogame-planet-name\']/@content',
            planet_coords: '//meta[@name=\'ogame-planet-coordinates\']/@content',
            planet_type: '//meta[@name=\'ogame-planet-type\']/@content'
        },
        ally_members_list: {
            rows: '//table[@id="member-list"]/tbody/tr',
            player: 'td[1]',
            rank: 'td[4]/a',
            points: 'td[4]/@title',
            coords: 'td[5]/span/a',
            tag: '//table[@class="members bborder"]/tbody/tr[2]/td[2]/span'
        },
        overview: {
            cases: './/*[@id=\'diameterContentField\']/span[2]/text()',
            temperatures: './/*[@id=\'temperatureContentField\']/text()'
        },
        galaxy: {
            rows: '//tr[contains(@class, "row")]',
            position: 'td[contains(@class, "position")]/text()',
            planetname: 'td[contains(@class,"planetname")]/text()',
            planetname_l: 'td[contains(@class,"planetname")]/a/text()',
            planetname_tooltip: 'td[contains(@class,"microplanet")]//div[contains(@id,"planet")]/h1/span/text()',
            moon: 'td[contains(@class,"moon")]/a',
            debris: 'descendant::li[contains(@class,"debris-content")]',
            playername: 'td[contains(@class,"playername")]//span[starts-with(@class,"status_")]/text()',
            //* pour a en general, span pour joueur courant,
            playername2: 'td[contains(@class,"playername")]/*[2]/text()',
            //Pour joueur bandit ou empereur
            playername_tooltip: 'td[contains(@class,"playername")]//div[contains(@id,"player")]/h1/span/text()',
            allytag: 'td[contains(@class, "allytag")]/span/text()',
            status: 'descendant::span[starts-with(@class,"status_") and @title]',
            status_baned: 'descendant::span[starts-with(@class,"status_")]/a[@title]/text()',
            activity: 'td[contains(@class,"microplanet")]/div[contains(@class,"activity")]/text()',
            activity15: 'td[contains(@class,"microplanet")]/div[contains(@class,"minute15")]/@class',
            activity_m: 'td[contains(@class,"moon")]/div[contains(@class,"activity")]/text()',
            activity15_m: 'td[contains(@class,"moon")]/div[contains(@class,"minute15")]/@class',
            player_id: 'td[contains(@class,"playername")]/a[contains(@rel,"player")]/@rel',
            ally_id: 'td[contains(@class,"allytag")]/span[contains(@rel,"alliance")]/@rel',
            planet_id: 'td[contains(@class,"microplanet")]/@data-planet-id',
            moon_id: 'td[contains(@class,"moon")]/@data-moon-id',
            table_galaxy: '//table[@id="galaxytable"]/tbody',
            table_galaxy_header: '//table[@id="galaxytable"]/tbody/tr[@class="info info_header"]',
            galaxy_input: '//table[@id="galaxytable"]/@data-galaxy',
            system_input: '//table[@id="galaxytable"]/@data-system'
        },
        levels: {
            level: '//span[contains(@class,"level")]/text()'
        },
        messages: {
            showmessage: '//div[@class="showmessage"]',
            combatreport: '//div[@class="combatreport"]',
            messageid: '@data-message-id',
            messagebox: '//div[contains(@class,"messagebox")]',
            from: '//div[@class="infohead"]/table/tbody/tr[1]/td/span',
            to: '//div[@class="infohead"]/table/tbody/tr[2]/td/text()',
            subject: '//div[@class="infohead"]/table/tbody/tr[3]/td/text()',
            date: '//div[@class="infohead"]/table/tbody/tr[4]/td/text()',
            reply: '//*[contains(@class,"toolbar")]/li[contains(@class,"reply")]',
            contents: {
                'spy': '//div[@class="note"]',
                'msg': '//div[contains(@class,"other")]',
                'ally_msg': '//div[@class="note"]',
                'expedition': '//div[@class="note"]',
                'rc': '//div[contains(@class,"battlereport")]',
                'rc_cdr': '//div[@class="note"]',
                'ennemy_spy': '//div[@class="textWrapper"]/div[@class="note"]',
                'livraison': '//div[@class="note"]',
                'livraison_me': '//div[@class="note"]',
                'url_combatreport': '//a[contains(@data-overlay-title,"Rapport de combat")]/@href'
            },
            spy: {
                playername: '//table[@class="material spy"]//span[contains(@class,"status")]/text()',
                materialfleetdefbuildings: '//table[contains(@class,"fleetdefbuildings") or contains(@class,"material spy")]//th[@class="area"]',
                moon: '//td[@class="attack"]/a/@href'
            }
        },
        parseTableStruct: {
            units: 'id(\'buttonz\')//ul/li/div/div',
            id: 'a[starts-with(@id,\'details\')]',
            number: 'a/span'
        },
        planetData: {
            name: 'id(\'selectedPlanetName\')',
            name_planete: '//span[@class=\'planet-name\']',
            coords: '//div[@class=\'smallplanet\']/a[contains(@class,\'active\') or @href=\'#\']/span[@class=\'planet-koords\']',
            coords_unique_planet: '//div[@class=\'smallplanet\']/a[contains(@class,\'\') or @href=\'#\']/span[@class=\'planet-koords\']'
        },
        boostersExtensions: {
            items: '//ul[contains(@class,"active_items")]//div[@data-uuid]//a[@title]',
            dataUuid: '../@data-uuid',
            itemTime: '//div[contains(@class,"js_duration")]',
            title: '@title'
            //*[@id="buffBar"]/div[2]/div/ul/li/div/a
        },
        ranking: {
            date: '//div[@id=\'OGameClock\']/text()',
            time: '//div[@id=\'OGameClock\']/span/text()',
            who: '//div[@id=\'categoryButtons\']/a[contains(@class,\'active\')]/@id',
            type: '//div[@id=\'typeButtons\']/a[contains(@class,\'active\')]/@id',
            subnav_fleet: '//div[@id=\'subnav_fleet\']/a[contains(@class,\'active\')]/@rel',
            rows: 'id(\'ranks\')/tbody/tr',
            position: 'td[contains(@class,\'position\')]/text()',
            points: 'td[contains(@class,\'score\')]/text()',
            nb_vaisseaux: 'td[contains(@class,\'score\')]/@title',
            allytag: 'td[@class=\'name\']/div[@class=\'ally-tag\']/a/text() | td[@class=\'name\']/span[@class=\'ally-tag\']/a/text()',
            ally_id: 'td[@class=\'name\']/div[@class=\'ally-tag\']/a/@href | td[@class=\'name\']/span[@class=\'ally-tag\']/a/@href',
            player: {
                playername: 'td[@class=\'name\']//a[contains(@href,\'galaxy\') and contains(@href,\'system\')]/span/text()',
                player_id: 'td[@class=\'sendmsg\']//a[contains(@href,\'writemessage\')]/@href',
                spacecraft: 'td[contains(@class,\'score\')]/@title'
            },
            ally: {
                members: 'td[contains(@class,\'member_count\')]/text()',
                points_moy: 'td[contains(@class,\'score\')]/div/text()',
                allytag: 'td[@class=\'name\']/div[@class=\'ally-tag\']/a/text()',
                ally_id: 'td[@class=\'name\']/div[@class=\'ally-tag\']/a/@href'
            }
        },
        ressources: {
            metal: '//span[@id=\'resources_metal\']/text()',
            cristal: '//span[@id=\'resources_crystal\']/text()',
            deuterium: '//span[@id=\'resources_deuterium\']/text()',
            antimatiere: '//span[@id=\'resources_darkmatter\']/text()',
            energie: '//span[@id=\'resources_energy\']/text()'
        },
        rc: {
            list_infos: '//td[contains(@class,"newBack")]/center',
            list_rounds: '//div[@class="round_info"]',
            infos: {
                player: 'span[contains(@class, "name")]',
                weapons: 'span[contains(@class, "weapons")]',
                destroyed: 'span[contains(@class, "destroyed")]'
            },
            list_types: 'table//tr[1]/th',
            list_values: 'table//tr[2]/td',
            result: '//div[@id="combat_result"]',
            combat_round: '//div[@id="master"]'//div[@class="combat_round"]'
        },
        writemessage: {
            form: '//form[1]',
            from: 'id("wrapper")/form/div/table/tbody/tr[1]/td',
            to: 'id("wrapper")/form/div/table/tbody/tr[2]/td',
            subject: 'id("wrapper")/form/div[1]/table/tbody/tr[3]/td/input',
            date: 'id("wrapper")/form/div/table/tbody/tr[4]/td',
            content: 'id("wrapper")/form/div[2]/div/textarea'
        },

        eventlist: {
            overview_event: '//span[@id="eventHostile"]/text()',
            attack_id: '@id',
            attack_event: '//tr[contains(@class,"eventFleet") and td[contains(@class,"hostile")]]',
            attack_arrival_time: 'td[@class="arrivalTime"]/text()',
            attack_datetime: '@data-arrival-time',
            attack_origin_attack_planet: 'td[@class="originFleet"]/a',
            attack_origin_attack_coords: 'td[@class="coordsOrigin"]/a/text()',
            attack_attacker_name: 'td[@class="sendMail"]/a/@title',
            attack_destination_planet: 'td[@class="destFleet"]',
            attack_destination_coords: 'td[@class="destCoords"]/a/text()',
            attack_url_composition_flotte: 'td[@class="icon_movement"]/span/@href',
            attack_composition_details: "td[@class='icon_movement']/span/@title",
            group_id: '//tr[contains(@class,"allianceAttack")]/td[a[contains(@class,"toggleDetails")]]/a/@rel',
            group_event: '//tr[starts-with(@class,"partnerInfo eventFleet {0}")]',
            group_attack: '//tr[contains(@class,"allianceAttack") and td[a[contains(@class,"toggleDetails")]]/a/@rel=\'{0}\']',
            group_attack_parent: '//tr[contains(@class,"allianceAttack") and td[a/@rel=\'{0}\']]',
            group_arrival_time: 'td[@class="arrivalTime"]/text()',
            group_origin_attack_planet: 'td[@class="originFleet"]/a',
            group_origin_attack_coords: 'td[@class="coordsOrigin"]/a/text()',
            group_attacker_name: 'td[@class="sendMail"]/a/@data-player-name',
            group_destination_planet: 'td[contains(@class,"destFleet")]',
            group_destination_coords: 'td[contains(@class,"destCoords")]/a/text()',
            group_compo_details: "td[@class='icon_movement']/span/@title",
            group_url_compo: 'td[@class="icon_movement"]/span/@rel'
        }
    };
    XtenseRegexps = {
        planetNameAndCoords: ' (.*) \\[(\\d+:\\d+:\\d+)\\]',
        planetCoords: '\\[(\\d+:\\d+:\\d+)\\]',
        userNameAndCoords: '(.*) \\[(\\d+:\\d+:\\d+)\\]',
        userNameAndDestroyed: ' (.*) d.truit',
        moon: '=(\\d+)*',
        messages: {
            ennemy_spy: '\\[(\\d+:\\d+:\\d+)\\][^\\]]*\\[(\\d+:\\d+:\\d+)\\][^%\\d]*([\\d]+)[^%\\d]*%',
            trade_message_infos: 'Une flotte .trang.re de (.*) [(](.*)\\[(\\d+:\\d+:\\d+)\\][)] a livr. des ressources . (.*) \\[(\\d+:\\d+:\\d+)\\]',
            trade_message_infos_me: 'Votre flotte de la plan.te (.*) \\[(\\d+:\\d+:\\d+)\\] a atteint la plan.te (.*) \\[(\\d+:\\d+:\\d+)\\] et y a livr. les ressources suivantes',
            trade_message_infos_res_livrees: '(.*)Vous aviez [:]',
            trade_message_infos_res: 'tal(.*)Cristal(.*)Deut.rium(.*)',
            trade_message_infos_me_res: 'tal(.*)Cristal(.*)Deut.rium(.*)'
        },
        probability: ': (\\d+) %',
        coords: '\\[(\\d+:\\d+:\\d+)\\]',
        ally: 'Alliance \\[(.*)\\]',
        ally_msg_player_name: 'Courrier group. de (.*)',
        ally_msg_player_infos: 'Le joueur <span.*</span> vous a envoy. ce message&nbsp;:<br>\n((.*\n)*)',
        parseTableStruct: '<a[^>]*id="details(\\d+)"[^>]*>[\\D\\d]*?([\\d.]+[KMG]?)</span>[^<]*</span>[^<]*</a>'
    };
    /* Fonctions permettant de rÃ©cupÃ©rer les donnÃ©es des balises metas */

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
        getLanguage: function () {
            return Xpath.getStringValue(document, XtenseXpaths.metas.language);
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
    }
}
