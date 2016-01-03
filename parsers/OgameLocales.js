/**
 * @author OGSteam
 * @license GNU/GPL
 */

/************************ Locales & Lang ********************************/
/* Fonction d'implementation des locales, lang */

function Ximplements(object, implement) {
    for (var i in implement) object[i] = implement[i];
}
/* Fonction initialisation des locales des status (retours OGSPY) */

function initLocales() {
    if (XtenseMetas.getLanguage() == 'fr') {

        Xlang = {
            http_status_403: 'statut 403, Impossible d\'acceder au plugin Xtense.',
            http_status_404: 'statut 404, Plugin Xtense introuvable, vérifiez que vous avez bien mis la bonne adresse vers le plugin Xtense',
            http_status_500: 'statut 500: Erreur interne au serveur.',
            http_timeout: 'Le serveur n\'a pas répondu à temps. Verifiez que votre hébergeur ne rencontre pas des problèmes de réseau.',
            //
            empty_response: 'Réponse du plugin vide',
            invalid_response: 'Impossible de récupérer les données envoyées par le plugin, verifiez que votre hebergeur ne rajoute pas de la pub, ce qui peut provoquer cette erreur.',
            //
            php_version: 'La version PHP de votre hébergement n\'est pas assez récente. Xtense requiert au minimum la version 5.1 de PHP.',
            wrong_version_plugin: 'Vous ne pouvez pas vous connecter au plugin, sa version est trop vielle pour pouvoir être utilisée avec votre barre d\'outils. Version du plugin : $1, version requise : $2 \nVous devez mettre à jour le plugin Xtense avant de pouvoir continuer',
            // Actual pluhin version, version required
            wrong_version_xtense: 'Votre fichier xtense.php n\'a pas la même version que celle du plugin installé',
            wrong_version_toolbar: 'Vous ne pouvez pas vous connecter au plugin avec votre version de Xtense.\nVotre version : $1, requise : $2\nVous devez mettre à jour votre barre d\'outils Xtense avant de pouvoir continuer',
            // Actual toolbar version, version required
            server_active: 'le serveur OGSpy est pour le moment désactivé',
            plugin_connections: 'Connexions au plugin Xtense désactivées',
            plugin_config: 'Plugin Xtense non configuré par votre administrateur, impossible de l\'utiliser',
            plugin_univers: 'Numéro d\'univers d\'Ogame invalide sur cet OGSpy',
            username: 'Le compte "$1" est inconnu. Attention à la casse (différence Majuscules / minuscules)',
            // Username
            password: 'Votre mot de passe n\'est pas bon. Attention à la casse (différence Majuscules / minuscules)',
            user_active: 'Votre compte est inactif, vous ne pouvez pas vous connecter',
            //
            informations: 'Informations',
            server_name: 'Nom du serveur OGSpy',
            // Server name TODO : A internationaliser dans les options
            version: 'Version',
            // version
            //
            grant_can: 'pouvez',
            grant_cannot: 'ne pouvez pas',
            grant_system: 'Vous $1 ajouter des systêmes solaires',
            // can / cannot
            grant_ranking: 'Vous $1 ajouter des classements',
            // can / cannot
            grant_empire: 'Vous $1 mettre à jour votre espace personnel (Batiments, Recherches, Empire...)',
            // can / cannot
            grant_messages: 'Vous $1 ajouter de messages (Rapports d\'espionnages, Rapports de combats, Espionnages ennemis...)',
            // can / cannot
            //
            unknow_page: 'Page inconnue',
            Xtense_activated: 'Activer',
            Xtense_deactivated: 'Desactiver',
            wait_send: 'En attente de l\'envoi manuel des données',
            unavailable_parser_lang: 'Xtense ne prend pas en charge ce serveur de jeu ($1)',
            // lang (ogame domain extension) TODO
            //
            overview_detected: 'Vue générale détectée',
            buildings_detected: 'Batiments détectés',
            installations_detected: 'Installations détectés',
            researchs_detected: 'Recherches détectés',
            fleet_detected: 'Flotte détectée',
            defense_detected: 'Défenses détectés',
            messages_detected: 'Page de messages détectée',
            ranking_detected: 'Statistiques $2 des $1 détectées',
            // Primary type (ally/player), Secondary type (points, research, fleet)
            ally_list_detected: 'Liste des joueurs de l\'alliance détectée',
            system_detected: 'Système solaire détecté: ',
            // Galaxy, System
            re_detected: 'Rapport d\'espionnage détecté',
            rc_detected: 'Rapport de combat détecté',
            res_detected: 'Message de commerce détecté',
            //
            ranking_player: 'joueurs',
            ranking_ally: 'alliances',
            ranking_points: 'points',
            ranking_fleet: 'militaire',
            ranking_research: 'recherches',
            ranking_defense: 'défense',
            ranking_buildings: 'bâtiments',
            ranking_fleet5: 'militaire construit',
            ranking_fleet6: 'militaire destruction',
            ranking_fleet4: 'militaire pertes',
            ranking_fleet7: 'militaire honneur',
            ranking_economy: 'économique',
            //
            invalid_system: 'Systême solaire non pris en compte',
            invalid_ranking: 'Page des statistiques invalide',
            invalid_rc: 'Rapport de combat invalide (Contact perdu)',
            no_ranking: 'Aucun classement à envoyer',
            no_messages: 'Aucun message à envoyer',
            // Responses
            response_start: 'Serveur $1 : ',
            // Serveur number
            http_status_unknow: 'Code d\'erreur Inconnu $1',
            // Http status
            response_hack: 'Les données envoyées ont été refusées par le plugin Xtense',
            //
            error_php_version: 'Le plugin requiert PHP 5.1 pour fonctionner, la version actuelle ($1) n\'est pas assez récente',
            error_wrong_version_plugin: 'La version du mod Xtense sur le serveur est incompatible avec la version de votre barre d\'outils (requise: $1, version du mod : $2)',
            // required version, actual version
            error_wrong_version_xtense: 'Votre fichier xtense.php n\'a pas la même version que celle du plugin installé',
            error_wrong_version_toolbar: 'La version de la barre d\'outils Xtense est incompatible avec celle du plugin (requise: $1, votre version: $2)',
            // required version, actual version
            error_server_active: 'Serveur OGSpy inactif (Raison: $1)',
            // reason
            error_username: 'Pseudo invalide',
            error_password: 'Mot de passe invalide',
            error_user_active: 'Votre compte est inactif',
            error_home_full: 'Votre espace personnel est plein, impossible de rajouter une nouvelle planête',
            error_plugin_connections: 'Connexions au plugin Xtense non autorisées',
            error_plugin_config: 'Plugin Xtense non configuré par votre administrateur, impossible de l\'utiliser',
            error_plugin_univers: 'Numéro d\'univers d\'Ogame invalide sur cet OGSpy',
            error_grant_start: 'Vous ne possédez pas les autorisations nécessaires pour envoyer ',
            error_grant_empire: 'des pages de votre empire (Bâtiments, Laboratoire...)',
            error_grant_messages: 'des messages',
            error_grant_system: 'des systèmes solaires',
            error_grant_ranking: 'des classements',
            //
            success_home_updated: 'Espace personnel mis à jour ($1)',
            // Page name
            success_system: 'Mise à jour du système solaire [$1:$2] effectuée',
            // Galaxy, System
            success_ranking: 'Classement $2 des $1 ($3-$4) mis à jour',
            // Primary type, secondary type, offset min, offset max
            success_rc: 'Rapport de combat envoyé',
            success_ally_list: 'Liste des joueurs de l\'alliance [$1] correctement envoyée',
            // TAG
            success_messages: 'Message correctement envoyé',
            success_fleetSending: 'Départ de flotte correctement envoyé',
            success_spy: 'Rapport d\'espionnage correctement envoyé',
            success_res: 'Message de commerce correctement envoyé',
            success_research: 'Mise à jour des technologies effectuée',
            success_buildings: 'Mise à jour des bâtiments effectuée',
            success_station: 'Mise à jour des installations effectuée',
            //
            unknow_response: 'Code réponse inconnu : "$1", data: "$2"',
            // code, content
            //
            page_overview: 'Vue générale',
            page_buildings: 'Bâtiments',
            page_installations: 'Installations',
            page_labo: 'Laboratoire',
            page_defense: 'Défense',
            page_fleet: 'Flotte',
            page_fleetSending: 'Départ de flotte',
            //
            //'PM':'MP',
            call_messages: '-- Messages renvoyés par les appels'
        }
    }

    if (XtenseMetas.getLanguage() == 'en') {
        //TODO : à traduire !! 
        //Xlang = {};
    }
    Ximplements(XtenseLocales, {
        'fr': {
            'spy reports': {
                'groups': {
                    'resources': 'Ressources',
                    'buildings': 'Bâtiment',
                    'defense': 'Défense',
                    'fleet': 'Flottes',
                    'researchs': 'Recherche',
                    'comment': 'Commentaire'
                },
                'units': {
                    'resources': {
                        601: 'metal',
                        602: 'crystal',
                        603: 'deuterium',
                        604: 'energy'
                    },
                    'buildings': {
                        1: 'Mine de métal',
                        2: 'Mine de cristal',
                        3: 'Synthétiseur de deutérium',
                        4: 'Centrale électrique solaire',
                        12: 'Centrale électrique de fusion',
                        14: 'Usine de robots',
                        15: 'Usine de nanites',
                        21: 'Chantier spatial',
                        22: 'Hangar de métal',
                        23: 'Hangar de cristal',
                        24: 'Réservoir de deutérium',
                        31: 'Laboratoire de recherche',
                        33: 'Terraformeur',
                        34: 'Dépôt de ravitaillement',
                        44: 'Silo de missiles',
                        41: 'Base lunaire',
                        42: 'Phalange de capteur',
                        43: 'Porte de saut spatial'
                    },
                    'researchs': {
                        106: 'Technologie Espionnage',
                        108: 'Technologie Ordinateur',
                        109: 'Technologie Armes',
                        110: 'Technologie Bouclier',
                        111: 'Technologie Protection des vaisseaux spatiaux',
                        113: 'Technologie .nerg.tique',
                        114: 'Technologie hyperespace',
                        115: 'Réacteur à combustion',
                        117: 'Réacteur à impulsion',
                        118: 'Propulsion hyperespace',
                        120: 'Technologie Laser',
                        121: 'Technologie à ions',
                        122: 'Technologie Plasma',
                        123: 'Réseau de recherche intergalactique',
                        124: 'Astrophysique',
                        199: 'Technologie Graviton'
                    },
                    'fleet': {
                        202: 'Petit transporteur',
                        203: 'Grand transporteur',
                        204: 'Chasseur léger',
                        205: 'Chasseur lourd',
                        206: 'Croiseur',
                        207: 'Vaisseau de bataille',
                        208: 'Vaisseau de colonisation',
                        209: 'Recycleur',
                        210: 'Sonde d`espionnage',
                        211: 'Bombardier',
                        212: 'Satellite solaire',
                        213: 'Destructeur',
                        214: 'Étoile de la mort',
                        215: 'Traqueur'
                    },
                    'defense': {
                        401: 'Lanceur de missiles',
                        402: 'Artillerie laser légère',
                        403: 'Artillerie laser lourde',
                        404: 'Canon de Gauss',
                        405: 'Artillerie à ions',
                        406: 'Lanceur de plasma',
                        407: 'Petit bouclier',
                        408: 'Grand bouclier',
                        502: 'Missile d`interception',
                        503: 'Missile Interplanétaire'
                    },
                    'comment': {}
                },
                'ogameAPI_link' : 'ogame-api'
            },
            'combat report': {
                'units': {
                    'fleet': {
                        202: 'P.transp.',
                        203: 'G.transp.',
                        204: 'Ch.léger',
                        205: 'Ch.lourd',
                        206: 'Croiseur',
                        207: 'V.bataille',
                        208: 'Vaisseau de colonisation',
                        209: 'Recycleur',
                        210: 'Sonde',
                        211: 'Bombardier',
                        212: 'Sat.sol.',
                        213: 'Destr.',
                        214: 'Rip',
                        215: 'Traqueur'
                    },
                    'defense': {
                        401: 'Missile',
                        402: 'L.léger.',
                        403: 'L.lourd',
                        404: 'Can.Gauss',
                        405: 'Art.ions',
                        406: 'Lanc.plasma',
                        407: 'P.bouclier',
                        408: 'G.bouclier'
                    }
                },
                'unitsCost': {
                    202: 4000,
                    203: 12000,
                    204: 4000,
                    205: 10000,
                    206: 29000,
                    207: 60000,
                    208: 40000,
                    209: 18000,
                    210: 1000,
                    211: 90000,
                    212: 2500,
                    213: 125000,
                    214: 10000000,
                    215: 85000,
                    401: 2000,
                    402: 2000,
                    403: 8000,
                    404: 37000,
                    405: 8000,
                    406: 130000,
                    407: 20000,
                    408: 130000
                },
                'regxps': {
                    'time': '/(\d+).(\d+).(\d+)\s(\d+):(\d+):(\d+)/',
                    'round': {
                        'a_nb': 'La flotte attaquante tire ([\\d|\\.]*) fois ',
                        'a_shoot': 'avec une force totale de ([\\d|\\.]*) sur le défenseur.',
                        'd_bcl': 'Les boucliers du défenseur absorbent ([\\d|\\.]*) points de dommage.',
                        'd_nb': 'La flotte de défense tire ([\\d|\\.]*) fois',
                        'd_shoot': 'sur l`attaquant avec une force de ([\\d|\\.]*)\. Les boucliers',
                        'a_bcl': ' de l`attaquant absorbent ([\\d|\\.]*) points de dommage'
                    },
                    'result': {
                        'win': {
                            'win_metal': 'metal',
                            'win_cristal': 'crystal',
                            'win_deut': 'deuterium'
                        },
                        'deb': {
                            'deb_metal': 'metal',
                            'deb_cristal': 'crystal'
                        },
                        'a_lost': 'L`attaquant a perdu au total (.*) unités.',
                        'd_lost': 'Le défenseur a perdu au total (.*) unités.'
                    },
                    'weapons': {
                        'arm': 'weaponPercentage',
                        'bcl': 'shieldPercentage',
                        'coq': 'armorPercentage'
                    },
                    'moon': 'formant ainsi une lune',
                    'moonprob': 'une lune est de (\\d+) %',
                    'attack': 'Attaquant',
                    'defense': 'Défenseur',
                    'nul': 'match nul',
                    'attack_win' : 'L`attaquant a gagné la bataille',
                    'ogameAPI_link' : 'ogame-api'
                }
            },
            'messages': {
                'espionage of': 'Rapport d`espionnage de',
                'unespionage prob': 'Probabilité de contre-espionnage ',
                'activity': '(\\d+)</font> dernières minutes',
                'moon': 'type',
                'espionnage action': 'Activité d`espionnage',
                'fleet command': 'Tour de contrôle',
                'expedition result': 'Résultat de l`expédition ',
                'fleet': 'Flotte',
                'harvesting': 'exploitation du champ de débris',
                'combat of': 'Rapport de combat',
                'combat defence': 'Bataille de',
                'trade message 1': 'Livraison de ressources par',
                'trade message 2': 'Arriv.*e sur une plan.*te',
                'antimatiere' : 'antimatière'
            },
            'dates': {
                'messages': {
                    regexp: '(\\d+).(\\d+).(\\d+)[^\\d]+(\\d+):(\\d+):(\\d+)',
                    fields: {
                        year: 3,
                        month: 2,
                        day: 1,
                        hour: 4,
                        min: 5,
                        sec: 6
                    }
                },
                'messagesRC': {
                    regexp: '(\\d+).(\\d+).(\\d+)\\s(\\d+):(\\d+):(\\d+)',
                    fields: {
                        year: 3,
                        month: 2,
                        day: 1,
                        hour: 4,
                        min: 5,
                        sec: 6
                    }
                }
            }
        },

        'en': {
            'spy reports': {
                'groups': {
                    'resources': 'Resources',
                    'buildings': 'Buildings',
                    'defense': 'Defense',
                    'fleet': 'Fleet',
                    'researchs': 'Research'
                },
                'units': {
                    'resources': {
                        601: 'Metal',
                        602: 'Crystal',
                        603: 'Deuterium',
                        604: 'Energy'
                    },
                    'buildings': {
                        1: 'Metal Mine',
                        2: 'Crystal Mine',
                        3: 'Deuterium Synthesizer',
                        4: 'Solar Plant',
                        12: 'Fusion Reactor',
                        14: 'Robotics Factory',
                        15: 'Nanite Factory',
                        21: 'Shipyard',
                        22: 'Metal Storage',
                        23: 'Crystal Storage',
                        24: 'Deuterium Tank',
                        31: 'Research Lab',
                        33: 'Terraformer',
                        34: 'Alliance Depot',
                        44: 'Missile Silo',
                        41: 'Lunar Base',
                        42: 'Sensor Phalanx',
                        43: 'Jump Gate'
                    },
                    'researchs': {
                        106: 'Espionage Technology',
                        108: 'Computer Technology',
                        109: 'Weapons Technology',
                        110: 'Shielding Technology',
                        111: 'Armour Technology',
                        113: 'Energy Technology',
                        114: 'Hyperspace Technology',
                        115: 'Combustion Drive',
                        117: 'Impulse Drive',
                        118: 'Hyperspace Drive',
                        120: 'Laser Technology',
                        121: 'Ion Technology',
                        122: 'Plasma Technology',
                        123: 'Intergalactic Research Network',
                        124: 'Expedition Technology',
                        199: 'Graviton Technology'
                    },
                    'fleet': {
                        202: 'Small Cargo',
                        203: 'Large Cargo',
                        204: 'Light Fighter',
                        205: 'Heavy Fighter',
                        206: 'Cruiser',
                        207: 'Battleship',
                        208: 'Colony Ship',
                        209: 'Recycler',
                        210: 'Espionage Probe',
                        211: 'Bomber',
                        212: 'Solar Satellite',
                        213: 'Destroyer',
                        214: 'Deathstar',
                        215: 'Battlecruiser'
                    },
                    'defense': {
                        401: 'Rocket Launcher',
                        402: 'Light Laser',
                        403: 'Heavy Laser',
                        404: 'Gauss Cannon',
                        405: 'Ion Cannon',
                        406: 'Plasma Turret',
                        407: 'Small Shield Dome',
                        408: 'Large Shield Dome',
                        502: 'Anti-Ballistic Missiles',
                        503: 'Interplanetary Missiles'
                    }
                }
            },


            'dates': {
                'messages': {
                    regexp: '(\\d+)-(\\d+)[^\\d]+(\\d+):(\\d+):(\\d+)',
                    fields: {
                        year: -1,
                        month: 1,
                        day: 2,
                        hour: 3,
                        min: 4,
                        sec: 5
                    }
                }
            },

            'messages': {
                'espionage of': 'Espionage report of',
                'espionage prob': 'Chance of counter-espionage',
                'fleet command': 'Fleet Command',
                'expedition result': 'Expedition Result \\[(\\d+:\\d+:\\d+)\\]',
                'espionnage action': 'Espionage action',
                'fleet': 'Fleet',
                'harvesting': 'Harvesting report from DF'
            }
        }
    })
}