/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2025 OGSteam
 * @license     GNU GPL v2
 * @version     3.1.2
 */
/*eslint-env browser*/
/*global displayOptions,log,url, parse_ally_inserted, parse_messages, storageGetValue, storageSetValue, setStatus, displayXtense, xlang, XLOG_NORMAL, XLOG_SEND, save_my_planets_coords */
/*global parse_galaxy_system_inserted, parse_ranking_inserted, parse_overview, parse_researchs, parse_buildings, parse_station, parse_shipyard, parse_fleet, parse_defense, parse_ressource_settings */


/* Fonction ajoutant lancant le parsing de la vue alliance quand celle-ci est chargée */

function get_ally_content() {

  let target = document.getElementById('inhalt');
  let observer = new MutationObserver(function (mutations) {
    mutations.forEach(() => {
      parse_ally_inserted();
    });
  });
  let config = {attributes: true, childList: true, characterData: true};
  observer.observe(target, config);
}

/* Fonction ajoutant lancant le parsing de la vue classement quand celle-ci est chargée */

function get_message_content() {
  // Récupérer l'élément contenant les messages
  let target = document.getElementById('messagecontainercomponent');

  // Vérifier si l'élément existe
  if (!target) {
    log.error('Élément avec ID "messagecontainercomponent" introuvable');
    return;
  }

  // Variable pour éviter les appels multiples rapprochés
  let parseTimeout = null;
  let lastParseTime = 0;
  const PARSE_COOLDOWN = 2000; // 2 secondes minimum entre les parsing

  function debouncedParseMessages() {
    const now = Date.now();

    // Vérifier si assez de temps s'est écoulé depuis le dernier parsing
    if (now - lastParseTime < PARSE_COOLDOWN) {
      log.debug('Parsing en cooldown, ignoré');
      return;
    }

    // Annuler le timeout précédent s'il existe
    if (parseTimeout) {
      clearTimeout(parseTimeout);
    }

    // Programmer le parsing avec un délai
    parseTimeout = setTimeout(() => {
      lastParseTime = Date.now();
      log.info('Déclenchement du parsing des messages (debounced)');
      parse_messages();
      parseTimeout = null;
    }, 300);
  }

  // Créer l'observateur de mutations
  let observer = new MutationObserver(function (mutations) {
    let shouldParse = false;

    mutations.forEach((mutation) => {
      // Log pour débugger les mutations détectées (seulement si pas déjà en cours)
      if (!parseTimeout) {
        log.debug('Mutation détectée:', mutation.type, mutation.target.tagName || 'Unknown');
      }

      // Vérification des nœuds ajoutés
      if (mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          let node = mutation.addedNodes[i];

          // Vérifier si c'est un élément HTML (pas juste du texte)
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Conditions plus larges pour détecter les messages
            if (node.id && (
                node.id.includes('message') ||
                node.id.includes('fleet') ||
                node.id.includes('communication') ||
                node.id.includes('default')
              )) {
              shouldParse = true;
              log.debug('Mutation Message détectée via ID:', node.id);
              break;
            }

            // Vérifier les classes
            if (node.className && (
                node.className.includes('message') ||
                node.className.includes('pagination') ||
                node.className.includes('msg')
              )) {
              shouldParse = true;
              log.debug('Mutation Message détectée via classe:', node.className);
              break;
            }

            // Vérifier si c'est un conteneur de messages par le contenu
            if (node.querySelector && (
                node.querySelector('[data-msg-id]') ||
                node.querySelector('.msg') ||
                node.querySelector('.message')
              )) {
              shouldParse = true;
              log.debug('Mutation Message détectée via contenu');
              break;
            }
          }
        }
      }
    });

    // Si on a détecté un changement pertinent, utiliser le debounced parsing
    if (shouldParse) {
      debouncedParseMessages();
    }
  });

  // Configuration de l'observateur - plus sensible
  let config = {
    attributes: false, // Désactiver les attributs pour réduire le bruit
    childList: true,
    characterData: false,
    subtree: true
  };

  // Stocker l'observateur dans une variable globale pour pouvoir le déconnecter plus tard si nécessaire
  window.messageObserver = observer;

  // Activer l'observateur
  observer.observe(target, config);

  // Analyser la première page au chargement SEULEMENT si des messages sont déjà présents
  setTimeout(() => {
    // Vérifications plus larges pour détecter les messages existants
    let existingMessages = document.querySelector('#communicationmessagespage, #defaultmessagespage, [data-msg-id], .msg, .message');
    if (existingMessages) {
      log.debug('Messages déjà présents au chargement, lancement du parsing');
      lastParseTime = Date.now();
      parse_messages();
    } else {
      log.debug('Aucun message présent au chargement, attente des mutations DOM');

      // Vérification périodique au cas où les mutations ne se déclenchent pas
      let checkCount = 0;
      let checkInterval = setInterval(() => {
        checkCount++;
        let messages = document.querySelector('[data-msg-id], .msg, .message');
        if (messages) {
          log.info('Messages détectés par vérification périodique, lancement du parsing');
          clearInterval(checkInterval);
          lastParseTime = Date.now();
          parse_messages();
        } else if (checkCount >= 10) { // Arrêter après 10 tentatives
          clearInterval(checkInterval);
          log.debug('Arrêt de la vérification périodique des messages');
        }
      }, 1000);
    }
  }, 200);
}


/************************ Declenchement des Parsings sur Remplissage Ajax ************************/
function get_content(type) {
  let elementName;
  let func;
  let observerAttached = false;  // Flag pour savoir si un observateur a été attaché

  switch (type) {
    case 'system': // Fonction lancant le parsing de la vue galaxie quand celle-ci est chargée
      elementName = 'galaxyLoading';
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
      //elementName = 'alliance';
      func = parse_ally_inserted;
      break;
    case 'resourceSettings':
      func = parse_ressource_settings;
      break;
  }

  // Vérifier si l'élément existe et configurer l'observateur si c'est le cas
  if (elementName != null) {
    let target = document.getElementById(elementName);
    if (target !== null) {
      observerAttached = true;  // Marquer qu'un observateur a été attaché

      // Créer un observateur de mutations
      let observer = new MutationObserver(mutations => {
        mutations.forEach((mutation) => {
          log.debug('Mutation Observer : ' + mutation);

          // Pour les cas comme 'stats' qui peuvent causer des doubles déclenchements
          if (type === 'stats' || type === 'system' || type === 'overview' || type === 'alliance') {
            // Exécuter la fonction mais ne pas la réexécuter en fin de fonction
            func();
            observerAttached = true;  // S'assurer que nous n'appelons pas func() à la fin
          } else {
            func();
          }
        });
      });

      // Configuration de l'observateur
      let config = {attributes: true, childList: true, characterData: true};
      observer.observe(target, config);

      // Déconnecter l'ancien observateur s'il existe
      if (!window.xtenseObservers) window.xtenseObservers = {};
      if (window.xtenseObservers[type]) {
        window.xtenseObservers[type].disconnect();
      }
      window.xtenseObservers[type] = observer;
    } else {
      log.warn("Element not found for static observer");
    }
  }

  // Si un observateur a été configuré pour les types spécifiques qui causent des doubles déclenchements,
  // ne pas exécuter func() une deuxième fois
  if (observerAttached && (type === 'system' || type === 'alliance')) {
    return;  // Ne pas exécuter func() à la fin
  }

  // Pour tous les autres cas, ou si aucun observateur n'a pu être configuré
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
function handle_page(page) {
  let rights = page;
  if (page === 'fleet')
    rights = 'shipyard';

  if (storageGetValue("handle.".concat(rights), 'false').toString() === 'true' || storageGetValue('manual.send', 'false').toString() === 'true') {
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
  let regGalaxy = new RegExp(/component=(galaxy)/);
  let regOverview = new RegExp(/component=(overview)/);
  let regOption = new RegExp(/(xtense=Options)/);
  let regResearch = new RegExp(/component=(research)/);
  let regBuildings = new RegExp(/component=(supplies)/);
  let regStation = new RegExp(/component=(facilities)/);
  let regShipyard = new RegExp(/component=(shipyard)/);
  let regFleet1 = new RegExp(/component=(fleetdispatch)/);
  let regDefense = new RegExp(/component=(defenses)/);
  let regMessages = new RegExp(/component=(messages)/);
  let regAlliance = new RegExp(/component=(alliance)/);
  let regStats = new RegExp(/page=(highscore)/);
  let regRessources = new RegExp(/component=(resourceSettings)/, 'i');

  if (regOption.test(url)) {
    displayOptions();
  } else if (regGalaxy.test(url)) {
    handle_page("system");
  } else if (regOverview.test(url)) {
    save_my_planets_coords();
    handle_page("overview");
  } else if (regResearch.test(url)) {
    handle_page("researchs");
  } else if (regRessources.test(url)) {
    handle_page("resourceSettings");
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
