/**
 * Created by Anthony on 13/12/2015.
 */

/*eslint-env es6*/
/*eslint no-undef: "error"*/
/*eslint-env browser*/
/*global displayOptions,log,url*/


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

            log.debug('Mutation Message');
            parse_messages();
        });
    });
    let config = {attributes: false, childList: true, characterData: false, subtree: true};
    observer.observe(target, config);

    parse_messages(); // Première Page

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
        //console.log.info(document.body.serializeWithStyles());
        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                //log.info('Mutation Observer : ' + mutation.addedNodes);
                func();
            });
        });
        // configuration of the observer:
        let config = {attributes: true, childList: true, characterData: true};
        observer.observe(target, config);
    }

    //log.info('Static Observer : ' + 'Running ' + type);
    func();
}

/* Fonction d'envoi manuel */
function manual_send() {
    storageSetValue('manual.send', 'true');
    displayXtense();
    setStatus(XLOG_SEND, xlang('wait_send'));
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

    if(storageGetValue("handle.".concat(rights), 'false').toString() === 'true' || storageGetValue('manual.send', 'false').toString() === 'true')
    {
        storageSetValue("lastAction", "");
        get_content(page);
        storageSetValue("manual.send", "false");
    } else {
        manual_send();
    }
}

/* Controller Entry Point */

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
        handle_page("system");
    } else if (regOverview.test(url)) {
        save_my_planets_coords();
        handle_page("overview");
    } else if (regResearch.test(url)) {
        handle_page("researchs");
    } else if (regBuildings.test(url)) {
        handle_page("buildings");
    } else if (regStation.test(url)) {
        handle_page("station");
    } else if (regShipyard.test(url)) {
        handle_page("shipyard");
    } else if (regFleet1.test(url)) {
        handle_page("fleet");
    } else if (regDefense.test(url)) {
        handle_page("defense");
    } else if (regMessages.test(url)) {
        if (storageGetValue('handle.msg.msg', 'false').toString() === 'true' ||
            storageGetValue('handle.msg.ally', 'false').toString() === 'true' ||
            storageGetValue('handle.msg.spy', 'false').toString() === 'true' ||
            storageGetValue('handle.msg.ennemy.spy', 'false').toString() === 'true' ||
            storageGetValue('handle.msg.rc.cdr', 'false').toString() === 'true' ||
            storageGetValue('handle.msg.expeditions', 'false').toString() === 'true' ||
            storageGetValue('handle.msg.commerce', 'false').toString() === 'true'
        ) {
            get_message_content();
        }
    } else if (regAlliance.test(url)) {
        handle_page("alliance");
    } else if (regStats.test(url)) {
        handle_page("stats");
    } else {
        setStatus(XLOG_NORMAL, xlang("unknow_page"));
    }
}

