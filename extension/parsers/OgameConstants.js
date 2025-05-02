/**
 * @author OGSteam
 * @license GNU/GPL
 */

/*eslint-env browser*/
/*global log*/

/**************** PARSERS & Communication OGSPY *************************/

/* Fonction permettant d'initialiser les Xpaths, les parsers Xpath et le parser des metasdonnées */

function initParsers() {
  /**
   * Utilitaire pour manipuler les expressions XPath dans le document
   */
  Xpath = {
    /**
     * Méthode privée pour évaluer une expression XPath
     * @param {Document} doc - Le document à utiliser
     * @param {string} xpath - L'expression XPath à évaluer
     * @param {Node|null} node - Le nœud de contexte (facultatif)
     * @param {number} resultType - Le type de résultat souhaité
     * @returns {XPathResult} - Le résultat de l'évaluation XPath
     * @private
     */
    _evaluate: function (doc, xpath, node, resultType) {
      // Si node est null ou undefined, utiliser doc comme contexte
      node = node ? node : doc;
      return doc.evaluate(xpath, node, null, resultType, null);
    },

    /**
     * Récupère une valeur numérique à partir d'une expression XPath
     * @param {Document} doc - Le document à utiliser
     * @param {string} xpath - L'expression XPath à évaluer
     * @param {Node} [node] - Le nœud de contexte (facultatif)
     * @returns {number} - La valeur numérique résultante
     */
    getNumberValue: function (doc, xpath, node) {
      return this._evaluate(doc, xpath, node, XPathResult.NUMBER_TYPE).numberValue;
    },

    /**
     * Récupère une valeur chaîne à partir d'une expression XPath
     * @param {Document} doc - Le document à utiliser
     * @param {string} xpath - L'expression XPath à évaluer
     * @param {Node} [node] - Le nœud de contexte (facultatif)
     * @returns {string} - La valeur chaîne résultante
     */
    getStringValue: function (doc, xpath, node) {
      return this._evaluate(doc, xpath, node, XPathResult.STRING_TYPE).stringValue;
    },

    /**
     * Récupère un instantané ordonné des nœuds correspondant à l'expression XPath
     * @param {Document} doc - Le document à utiliser
     * @param {string} xpath - L'expression XPath à évaluer
     * @param {Node} [node] - Le nœud de contexte (facultatif)
     * @returns {XPathResult} - Le résultat de type snapshot ordonné
     */
    getOrderedSnapshotNodes: function (doc, xpath, node) {
      return this._evaluate(doc, xpath, node, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    },

    /**
     * Récupère un instantané non ordonné des nœuds correspondant à l'expression XPath
     * @param {Document} doc - Le document à utiliser
     * @param {string} xpath - L'expression XPath à évaluer
     * @param {Node} [node] - Le nœud de contexte (facultatif)
     * @returns {XPathResult} - Le résultat de type snapshot non ordonné
     */
    getUnorderedSnapshotNodes: function (doc, xpath, node) {
      return this._evaluate(doc, xpath, node, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE);
    },

    /**
     * Récupère un seul nœud correspondant à l'expression XPath
     * @param {Document} doc - Le document à utiliser
     * @param {string} xpath - L'expression XPath à évaluer
     * @param {Node} [node] - Le nœud de contexte (facultatif)
     * @returns {Node|null} - Le nœud unique trouvé ou null
     */
    getSingleNode: function (doc, xpath, node) {
      return this._evaluate(doc, xpath, node, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
    }
  };


  XtenseXpaths = {
    metas: {
      ogame_version: "//meta[@name='ogame-version']/@content",
      timestamp: "//meta[@name='ogame-timestamp']/@content",
      universe: "//meta[@name='ogame-universe']/@content",
      universename: "//meta[@name='ogame-universe-name']/@content",
      universespeed: "//meta[@name='ogame-universe-speed']/@content",
      universespeedfleetpeaceful: "//meta[@name='ogame-universe-speed-fleet-peaceful']/@content",
      universespeedfleetwar: "//meta[@name='ogame-universe-speed-fleet-war']/@content",
      universespeedholding: "//meta[@name='ogame-universe-speed-fleet-holding']/@content",
      language: "//meta[@name='ogame-language']/@content",
      donutgalaxy: "//meta[@name='ogame-donut-galaxy']/@content",
      donutsystem: "//meta[@name='ogame-donut-system']/@content",
      player_id: "//meta[@name='ogame-player-id']/@content",
      player_name: "//meta[@name='ogame-player-name']/@content",
      planet_id: "//meta[@name='ogame-planet-id']/@content",
      planet_name: "//meta[@name='ogame-planet-name']/@content",
      planet_coords: "//meta[@name='ogame-planet-coordinates']/@content",
      planet_type: "//meta[@name='ogame-planet-type']/@content",
      ally_id: "//meta[@name='ogame-alliance-id']/@content",
      ally_name: "//meta[@name='ogame-alliance-name']/@content",
      ally_tag: "//meta[@name='ogame-alliance-tag']/@content"
    },
    ally_members_list: {
      rows: '//table[@id="member-list"]/tbody/tr',
      player: 'td[1]/span',
      rank: 'td[4]/a',
      points: 'td[4]/@title',
      coords: 'td[5]/span/a',
      tag: '//div[@id="allyData"]/div[@class="contentz"]/table/tbody/tr[2]/td[2]/span'
    },
    overview: {
      cases: './/*[@id=\'diameterContentField\']/span[2]/text()',
      temperatures: './/*[@id=\'temperatureContentField\']/text()'
    },
    ressourcesSettings: {
      rows: '//table[contains(@class, "listOfResourceSettingsPerPlanet")]/tbody/tr',
      rowName: 'td[contains(@class, "label")]/text()',
      rowPercent: 'td[7]/span/a/text()'
    },
    galaxy: {
      loading_div: '//div[contains(@id, "galaxyLoading")]',
      rows: '//div[contains(@class, "galaxyRow")]',
      position: 'div[contains(@class, "cellPosition")]/text()',
      planetname: 'div[contains(@class,"cellPlanetName")]/span/text()',
      planetname_l: 'div[contains(@class,"cellPlanetName")]/a/text()',
      planetname_tooltip: 'div[contains(@class,"microplanet")]//div[contains(@id,"planet")]/h1/span/text()',
      moon: 'div[contains(@class,"cellMoon")]/a',
      debris: 'descendant::li[contains(@class,"debris-content")]',
      playername: 'div[contains(@class,"cellPlayerName")]//span[contains(@rel,"player")]/text()',//* pour a en general, span pour joueur courant,
      playername2: 'div[contains(@class,"cellPlayerName")]//span[contains(@class,"ownPlayerRow")]/text()', //Pour soi même
      playername_tooltip: 'div[contains(@class,"playerName")]//div[contains(@id,"player")]/h1/span/text()',
      allytag: 'div[contains(@class, "cellAlliance")]/span/text()',
      status: 'div[contains(@class,"cellPlayerName")]//pre/span[starts-with(@class,"status_abbr")]',
      //status_baned: 'descendant::span[starts-with(@class,"status_")]/a[@title]/text()',
      activity: 'div[contains(@class,"cellPlanet")]/a/div[contains(@class,"microplanet")]/div[contains(@class,"activity")]/text()',
      activity15: 'div[contains(@class,"cellPlanet")]/a/div[contains(@class,"microplanet")]/div[contains(@class,"minute15")]/@class',
      activity_m: 'div[contains(@class,"cellMoon")]/a/div[contains(@class,"micromoon")]/div[contains(@class,"activity")]/text()',
      activity15_m: 'div[contains(@class,"cellMoon")]/a/div[contains(@class,"micromoon")]/div[contains(@class,"minute15")]/@class',
      player_id: 'div[contains(@class,"cellPlayerName")]/span[contains(@rel,"player")]/@rel',
      ally_id: 'div[contains(@class,"cellAlliance")]/span[contains(@rel,"alliance")]/@rel',
      planet_id: 'div[contains(@class,"cellPlanet")]/a/div[contains(@class,"microplanet")]/@data-planet-id',
      moon_id: 'div[contains(@class,"cellMoon")]/a/div[contains(@class,"micromoon")]/@data-moon-id',
      table_galaxy: '//div[@id="galaxytable"]/tbody',
      table_galaxy_header: '//table[@id="galaxytable"]/tbody/tr[@class="info info_header"]',
      galaxy_input: '//input[@id="galaxy_input"]',
      system_input: '//input[@id="system_input"]',
      debris16_m: '//*[@id="galaxyRow16"]/div/div[1]/text()',
      debris16_c: '//*[@id="galaxyRow16"]/div/div[2]/text()',
    },

    levels: {
      level: '//span[((contains(@class,"level") or contains(@class,"amount")) and not (contains(@class,"targetlevel")) and not (contains(@class,"targetamount")))]/@data-value',
      levelbonus: '//span[((contains(@class,"level") or contains(@class,"amount")) and not (contains(@class,"targetlevel")) and not (contains(@class,"targetamount")))]/@data-bonus'
    },

    messages: {
      shortmessages: '//div[contains(@id,"ui-id")][@aria-hidden="false"]/div/ul[contains(@class,"tab_inner")]/li[contains(@class, "msg ")]',
      showmessage: '//div[contains(@class,"detail_msg")]',
      combatreport: '//@data-combatreportid',
      messageid: "@data-msg-id",
      messagebox: '//div[contains(@class,"trucmuche")]', // ca sert a rien :)
      from: '//div[contains(@class,"detail_msg_head")]/span[4]',
      to: '//div[contains(@class,"detail_msg_head")]/table/tbody/tr[2]/td/text()',
      subject: '//div[contains(@class,"detail_msg_head")]/span',
      shortmsgcontent: 'span[contains(@class,"msg_content")]',
      date: '//div[contains(@class,"detail_msg_head")]/span[2]',
      reply: '//*[contains(@class,"toolbar")]/li[contains(@class,"reply")]',
      contents: {
        'spy': '//div[contains(@class,"detail_msg_ctn")]',
        'msg': '//div[contains(@class,"other")]',
        'ally_msg': '//div[contains(@class,"note")]',
        'expedition': '//div[contains(@class,"detail_txt")]',
        'rc': '//div[contains(@class,"battlereport")]',
        'rc_cdr': '//div[contains(@class,"note")]',
        'ennemy_spy': '//div[contains(@class,"textWrapper")]/div[contains(@class,"note")]',
        'livraison': '//div[contains(@class,"note")]',
        'livraison_me': '//div[contains(@class,"note")]',
        'url_combatreport': '//a[contains(@class,"msg_action_link")]/@href'
      },
      spy: {
        list_infos: '//div[contains(@class,"detail_msg")]',
        playername: '//div[contains(@class,"detail_txt")]//span[contains(@class,"status")]/text()',
        materialfleetdefbuildings: '//div[contains(@class,"section_title")] | //ul[contains(@class,"detail_list")]/li[contains(@class,"resource_list_el")] | //ul[contains(@class,"detail_list")]/li[contains(@class,"detail_list_el")]',
        moon: '//div[contains(@class,"detail_msg_head")]/div[contains(@class,"msg_actions")]/a[2]/@href',
        actions_links: '//div[contains(@class,"detail_msg")]/div[contains(@class,"detail_msg_head")]/div[contains(@class,"msg_actions")]/a'
      },
      tab: '//div[@aria-hidden="false"]//ul[contains(@class,"subtabs")]/li[@aria-selected ="true"]/@data-tabid',
      ogameapi: './/span[contains(@class, "icon_apikey")]/@title'
    },

    parseTableStruct: {
      units: "id('buttonz')//ul/li/div/div",
      id: "a[starts-with(@id,'details')]",
      number: "a/span"
    },

    planetData: {
      name: "id('selectedPlanetName')",
      name_planete: "//span[@class='planet-name']",
      coords: "//div[@id='planetList']//a[contains(@class,'planetlink')]/span[contains(@class,'planet-koords')]",
      coords_unique_planet: "//div[@id='planetList']//a[contains(@class,'') or @href='#']/span[contains(@class,'planet-koords')]"
    },
    playerData: {
      playerclass_explorer: "id('characterclass')/a/div[contains(@class,'explorer')]",
      playerclass_miner: "id('characterclass')/a/div[contains(@class,'miner')]",
      playerclass_warrior: "id('characterclass')/a/div[contains(@class,'warrior')]",
      officer_commander: "id('officers')/a[(@class='commander' and @class='on')]",
      officer_amiral: "id('officers')/a[(@class='amiral' and @class='on')]",
      officer_engineer: "id('officers')/a[(@class='engineer' and @class='on')]",
      officer_geologist: "id('officers')/a[(@class='geologist' and @class='on')]",
      officer_technocrate: "id('officers')/a[(@class='technocrate' and @class='on')]",
    },

    boostersExtensions: {
      items: '//ul[contains(@class,"active_items")]//div[@data-uuid]',
      dataUuid: 'a[@title]/@ref',
      itemTime: 'div[contains(@class,"js_duration")]/text()'
    },

    ranking: {
      date: "//div[@id='OGameClock']/text()",
      time: "//div[@id='OGameClock']/span/text()",
      who: "//div[@id='categoryButtons']/a[contains(@class,'active')]/@id",
      type: "//div[@id='typeButtons']/a[contains(@class,'active')]/@id",
      subnav_fleet: "//div[@id='subnav_fleet']/a[contains(@class,'active')]/@rel",

      rows: "id('ranks')/tbody/tr",
      position: "td[contains(@class,'position')]/text()",
      points: "td[contains(@class,'score')]/text()",
      allytag: "td[@class='name']//span[@class='ally-tag']/a/text()",
      allyname: "td[@class='name']/div[@class='ally-name']/span/text()",
      ally_id: "td[@class='name']//span[@class='ally-tag']/a/@href",
      player: {
        playername: "td[@class='name']//a[contains(@href,'galaxy') and contains(@href,'system')]/span/text()",
        player_id: "td[@class='sendmsg']/div/div/@id",
        spacecraft: "td[contains(@class,'score')]/@title"
      },

      ally: {
        members: "td[contains(@class,'member_count')]/text()",
        points_moy: "td[contains(@class,'score')]/div/text()",
        allytag: "td[@class='name']/div[@class='ally-tag']/a/text()",
        allyname: "td[@class='name']/div[@class='ally-name']/span/text()",
        ally_id: "td[@class='name']/div[@class='ally-tag']/a/@href"
      }
    },

    ressources: {
      metal: '//span[@id="resources_metal"]/text()',
      cristal: '//span[@id="resources_crystal"]/text()',
      deuterium: '//span[@id="resources_deuterium"]/text()',
      antimatiere: '//span[@id="resources_darkmatter"]/text()',
      energie: '//span[@id="resources_energy"]/text()'
    },

    rc: {
      list_infos: '//div[contains(@class,"detail_msg")]',
      script: '//div[contains(@class, "detail_msg_ctn")]/div/div/script[1]',
      list_rounds: '//li[contains(@class,"round_id")]',
      win_resource: '//div[contains(@class,"loot")]//li[contains(@class,"resource_list_el_small")]/span[contains(@class,"res_value")] | //div[contains(@class,"loot")]//li[contains(@class,"resource_list_el_small")]',
      deb_resource: '//div[contains(@class,"tf")]//li[contains(@class,"resource_list_el_small")]//span[contains(@class,"res_value")] | //div[contains(@class,"tf")]//li[contains(@class,"resource_list_el_small")]',
      actions_links: '//div[contains(@class,"detail_msg")]/div[contains(@class,"detail_msg_head")]/div[contains(@class,"msg_actions")]/a',
      moon: '//div[contains(@class,"detailReport")]/div[contains(@class,"og_video")]',
      infos: {
        player: 'span[contains(@class, "name")]',
        weapons: 'span[contains(@class, "weapons")]',
        destroyed: 'span[contains(@class, "destroyed")]'
      },
      list_types: 'table//tr[1]/th',
      list_values: 'table//tr[2]/td',
      result: '//div[@id="combat_result"]',
      combat_round: '//div[@id="master"]'
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
    ogameapi: 'input value=\'([a-z0-9-]+)\'',
    messages: {
      /*ennemy_spy: '\\[(\\d+:\\d+:\\d+)\\][^\\]]*\\[(\\d+:\\d+:\\d+)\\][^%\\d]*([\\d]+)[^%\\d]*%',*/
      ennemy_spy: '(.*).\\[(\\d+:\\d+:\\d+)\\].(\\d+.\\d+.\\d+).(\\d+:\\d+:\\d+)$\\n(.*)\\n.*\\((.*)\\).*(\\d{1,3})%', //Inutile now
      ennemy_spy_to: '\\[(\\d+:\\d+:\\d+)\\]', //Texte message court
      ennemy_spy_from: 'fleet.*galaxy=(\\d+).*system=(\\d+).*position=(\\d+).*type=(\\d+).*mission=1', //Coordonnées du lien attaque type=1 pour planètre tu 3 pour lune
      ennemy_spy_proba: '\\:.(\\d{1,3})%',//Texte message court
      ennemy_spy_moon: '<figure\\sclass=.*(moon)',
      trade_message_infos: 'Une flotte .trang.re de (.*) [(](.*)\\[(\\d+:\\d+:\\d+)\\][)] a livr. des ressources . (.*) \\[(\\d+:\\d+:\\d+)\\]',
      trade_message_infos_me: 'Votre flotte de la plan.te (.*) \\[(\\d+:\\d+:\\d+)\\] a atteint la plan.te (.*) \\[(\\d+:\\d+:\\d+)\\] et y a livr. les ressources suivantes',
      trade_message_infos_res_livrees: '(.*)Vous aviez [:]',
      trade_message_infos_res: 'M.tal(.*)Cristal(.*)Deut.rium(.*)',
      trade_message_infos_me_res: 'tal(.*)Cristal(.*)Deut.rium(.*)'
    },
    spy: {
      player: " '(.*)'\\)"
    },
    probability: ': (\\d+) %',
    coords: '\\[(\\d+:\\d+:\\d+)\\]',
    ally: 'Alliance \\[(.*)\\]',
    ally_msg_player_name: '<a href.*>(.*)</a>',

    parseTableStruct: '<a[^>]*id="details(\\d+)"[^>]*>[\\D\\d]*?([\\d.]+[KMG]?)<\/span>[^<]*<\/span>[^<]*<\/a>'
  };

}


