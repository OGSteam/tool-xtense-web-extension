/**
 * @author OGSteam
 * @license GNU/GPL
 */

/*eslint-env es6*/
/*eslint no-undef: "error"*/
/*eslint-env browser*/
/*global log*/

/************************ Locales & Lang ********************************/
/* Fonction d'implementation des locales, lang */

function Ximplements(object, implement) {
    for (var i in implement) object[i] = implement[i];
}
/* Fonction initialisation des locales des status (retours OGSPY) */

function initLocales() {

    Ximplements(XtenseLocales, {
        'fr': {
            'spy reports': {
                'groups': {
                    'resources': 'Ressources',
                    'debris' : 'Champ de débris',
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
                    'debris' : {
                        701: 'metal',
                        702: 'crystal'
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
                        36: 'Dock Spatial',
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
                        215: 'Traqueur',
                        217: 'Foreuse',
                        218: 'Faucheur',
                        219: 'Eclaireur'
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
                'ogameAPI_link': 'ogame-api'
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
                    'attack_win': 'L`attaquant a gagné la bataille',
                    'ogameAPI_link': 'ogame-api'
                }
            },
            'messages': {
                'espionage of': 'Rapport d`espionnage de',
                'unespionage prob': 'Probabilité de contre-espionnage ',
                'activity': '(\\d+)</font> dernières minutes',
                'moon': 'Lune',
                'espionnage action': 'Activité d`espionnage',
                'fleet command': 'Tour de contrôle',
                'expeditionResult': 'Résultat de l`expédition ',
                'fleet': 'Flotte',
                'harvesting': 'exploitation du champ de débris',
                'combat of': 'Rapport de combat',
                'combat defence': 'Bataille de',
                'trade message 1': 'Livraison de ressources par',
                'trade message 2': 'Arriv.*e sur une plan.*te',
                'antimatiere': 'antimatière'
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
                    'researchs': 'Research',
					'comment': 'Comment'
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
                        36: 'Space Dock',
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
                        124: 'Astrophysics',
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
                    },
                    'comment': {}
                },
                'ogameAPI_link': 'ogame-api'
            },
            'combat report': {
                'units': {
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
                    'round': {
                        'a_nb': 'Attacker fires a total of ([\\d|\\.]*) shots ',
                        'a_shoot': 'at the Defender with a total strength of ([\\d|\\.]*) .',
                        'd_bcl': 'The defender`s shields absorb ([\\d|\\.]*) points of damage.',
                        'd_nb': 'The Defender fires a total of ([\\d|\\.]*) shots',
                        'd_shoot': 'at the Attacker with a total strength of ([\\d|\\.]*)\. ',
                        'a_bcl': 'The attacker`s shields absorb ([\\d|\\.]*) points of damage'
                    },
                    'result': {
                        'win': {
                            'win_metal': 'Metal',
                            'win_cristal': 'Crystal',
                            'win_deut': 'Deuterium'
                        },
                        'deb': {
                            'deb_metal': 'Metal',
                            'deb_cristal': 'Crystal'
                        },
                        'a_lost': 'The attacker lost a total of (.*) units.',
                        'd_lost': 'The defender lost a total of (.*) units.'
                    },
                    'weapons': {
                        'arm': 'weaponPercentage',
                        'bcl': 'shieldPercentage',
                        'coq': 'armorPercentage'
                    },
                    'moon': 'thereby forming a moon',
                    'moonprob': 'moon is (\\d+) %',
                    'attack': 'Attacker',
                    'defense': 'Defender',
                    'nul': 'Draw',
                    'attack_win': 'The attacker has won the battle',
                    'ogameAPI_link': 'ogame-api'
                }
            },
            'messages': {
                'espionage of': 'Espionage report from',
                'unespionage prob': 'Chance of counter-espionage',
                'activity': '(\\d+)</font> last minutes',
                'moon': 'Moon',
                'espionnage action': 'Espionage action',
                'fleet command': 'Fleet Command',
                'expeditionResult': 'Expedition Result',
                'fleet': 'Fleet',
                'harvesting': 'Harvesting report from DF',
                'combat of': 'Combat Report',
                'combat defence': 'Combat from',
                'trade message 1': 'Ressouces delivery from',
                'trade message 2': 'Arrival on a planet',
                'antimatiere': 'Dark matter'
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
        'de': {
            'spy reports': {
                'groups': {
                    'resources': 'Resources',
                    'buildings': 'Buildings',
                    'defense': 'Defense',
                    'fleet': 'Fleet',
                    'researchs': 'Research',
					'comment': 'Comment'
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
                        36: 'Space Dock',
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
                        124: 'Astrophysics',
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
                    },
                    'comment': {}
                },
                'ogameAPI_link': 'ogame-api'
            },
            'combat report': {
                'units': {
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
                    'round': {
                        'a_nb': 'Attacker fires a total of ([\\d|\\.]*) shots ',
                        'a_shoot': 'at the Defender with a total strength of ([\\d|\\.]*) .',
                        'd_bcl': 'The defender`s shields absorb ([\\d|\\.]*) points of damage.',
                        'd_nb': 'The Defender fires a total of ([\\d|\\.]*) shots',
                        'd_shoot': 'at the Attacker with a total strength of ([\\d|\\.]*)\. ',
                        'a_bcl': 'The attacker`s shields absorb ([\\d|\\.]*) points of damage'
                    },
                    'result': {
                        'win': {
                            'win_metal': 'Metal',
                            'win_cristal': 'Crystal',
                            'win_deut': 'Deuterium'
                        },
                        'deb': {
                            'deb_metal': 'Metal',
                            'deb_cristal': 'Crystal'
                        },
                        'a_lost': 'The attacker lost a total of (.*) units.',
                        'd_lost': 'The defender lost a total of (.*) units.'
                    },
                    'weapons': {
                        'arm': 'weaponPercentage',
                        'bcl': 'shieldPercentage',
                        'coq': 'armorPercentage'
                    },
                    'moon': 'thereby forming a moon',
                    'moonprob': 'moon is (\\d+) %',
                    'attack': 'Attacker',
                    'defense': 'Defender',
                    'nul': 'Draw',
                    'attack_win': 'The attacker has won the battle',
                    'ogameAPI_link': 'ogame-api'
                }
            },
            'messages': {
                'espionage of': 'Espionage report from',
                'unespionage prob': 'Chance of counter-espionage',
                'activity': '(\\d+)</font> last minutes',
                'moon': 'Moon',
                'espionnage action': 'Espionage action',
                'fleet command': 'Fleet Command',
                'expeditionResult': 'Expedition Result',
                'fleet': 'Fleet',
                'harvesting': 'Harvesting report from DF',
                'combat of': 'Combat Report',
                'combat defence': 'Combat from',
                'trade message 1': 'Ressouces delivery from',
                'trade message 2': 'Arrival on a planet',
                'antimatiere': 'Dark matter'
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
        'us': {
            'spy reports': {
                'groups': {
                    'resources': 'Resources',
                    'buildings': 'Building',
                    'defense': 'Defense',
                    'fleet': 'Fleets',
                    'researchs': 'Research',
                    'comment': 'Comment'
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
                        36: 'Space Dock',
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
                        124: 'Astrophysics',
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
                    },
                    'comment': {}
                },
                'ogameAPI_link': 'ogame-api'
            },
            'combat report': {
                'units': {
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
                    'round': {
                        'a_nb': 'The Attacker fires a total of ([\\d|\\.]*) shots ',
                        'a_shoot': 'at the Defender with a total strength of ([\\d|\\.]*)\.',
                        'd_bcl': 'The defender`s shields absorb ([\\d|\\.]*) points of damage.',
                        'd_nb': 'The Defender fires a total of ([\\d|\\.]*) shots',
                        'd_shoot': 'at the Attacker with a total strength of ([\\d|\\.]*)\. ',
                        'a_bcl': 'The attacker`s shields absorb ([\\d|\\.]*) points of damage'
                    },
                    'result': {
                        'win': {
                            'win_metal': 'Metal',
                            'win_cristal': 'Crystal',
                            'win_deut': 'Deuterium'
                        },
                        'deb': {
                            'deb_metal': 'Metal',
                            'deb_cristal': 'Crystal'
                        },
                        'a_lost': 'The attacker lost a total of (.*) units.',
                        'd_lost': 'The defender lost a total of (.*) units.'
                    },
                    'weapons': {
                        'arm': 'weaponPercentage',
                        'bcl': 'shieldPercentage',
                        'coq': 'armorPercentage'
                    },
                    'moon': 'thereby forming a moon',
                    'moonprob': 'moon is (\\d+) %',
                    'attack': 'Attacker',
                    'defense': 'Defender',
                    'nul': 'Draw',
                    'attack_win': 'The attacker has won the battle',
                    'ogameAPI_link': 'ogame-api'
                }
            },
            'messages': {
                'espionage of': 'Espionage report from',
                'unespionage prob': 'Chance of counter-espionage',
                'activity': '(\\d+)</font> last minutes',
                'moon': 'Moon',
                'espionnage action': 'Espionage action',
                'fleet command': 'Fleet Command',
                'expeditionResult': 'Expedition Result',
                'fleet': 'Fleet',
                'harvesting': 'Harvesting report from DF',
                'combat of': 'Combat Report',
                'combat defence': 'Combat from',
                'trade message 1': 'Ressouces delivery from',
                'trade message 2': 'Arrival on a planet',
                'antimatiere': 'Dark matter'
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
        'br': {
            'spy reports': {
                'groups': {
                    'resources': 'Recursos',
                    'buildings': 'Edifícios',
                    'defense': 'Defesas',
                    'fleet': 'Frotas',
                    'researchs': 'Pesquisas',
                    'comment': 'Comentário'
                },
                'units': {
                    'resources': {
                        601: 'Metal',
                        602: 'Cristal',
                        603: 'Deutério',
                        604: 'Energia'
                    },
                    'buildings': {
                        1: 'Mina de Metal',
                        2: 'Mina de Cristal',
                        3: 'Sintetizador de Deutério',
                        4: 'Planta de Energia Solar',
                        12: 'Planta de Fusão',
                        14: 'Fábrica de Robôs',
                        15: 'Fábrica de Nanites',
                        21: 'Hangar',
                        22: 'Armazém de Metal',
                        23: 'Armazém de Cristal',
                        24: 'Tanque de Deutério',
                        31: 'Laboratório de Pesquisas',
                        33: 'Terra-Formador',
                        34: 'Depósito de Aliança',
                        36: 'Space Dock',
                        44: 'Silo de Mísseis',
                        41: 'Base Lunar',
                        42: 'Sensor Phalanx',
                        43: 'Portal de Salto Quântico'
                    },
                    'researchs': {
                        106: 'Tecnologia de Espionagem',
                        108: 'Tecnologia de Computadores',
                        109: 'Tecnologia de Armas',
                        110: 'Tecnologia de Escudo',
                        111: 'Tecnologia de Blindagem',
                        113: 'Tecnologia de Energia',
                        114: 'Tecnologia de Hiperespaço',
                        115: 'Motor de Combustão',
                        117: 'Motor de Impulsão',
                        118: 'Motor Propulsor de Hiperespaço',
                        120: 'Tecnologia Laser',
                        121: 'Tecnologia de Íons',
                        122: 'Tecnologia de Plasma',
                        123: 'Rede Intergalática de Pesquisas',
                        124: 'Astrofísica',
                        199: 'Tecnologia de Gravitação'
                    },
                    'fleet': {
                        202: 'Cargueiro Pequeno',
                        203: 'Cargueiro Grande',
                        204: 'Caça Ligeiro',
                        205: 'Caça Pesado',
                        206: 'Cruzador',
                        207: 'Nave de Batalha',
                        208: 'Nave de Colonização',
                        209: 'Reciclador',
                        210: 'Sonda de Espionagem',
                        211: 'Bombardeiro',
                        212: 'Satélite Solar',
                        213: 'Destruidor',
                        214: 'Estrela da Morte',
                        215: 'Interceptador'
                    },
                    'defense': {
                        401: 'Lançador de Mísseis',
                        402: 'Laser Ligeiro',
                        403: 'Laser Pesado',
                        404: 'Canhão de Gauss',
                        405: 'Canhão de Íons',
                        406: 'Canhão de Plasma',
                        407: 'Pequeno Escudo Planetário',
                        408: 'Grande Escudo Planetário',
                        502: 'Míssil de Interceptação',
                        503: 'Míssil Interplanetário'
                    },
                    'comment': {}
                },
                'ogameAPI_link': 'ogame-api'
            },
            'combat report': {
                'units': {
                    'fleet': {
                        202: 'Cargueiro Pequeno',
                        203: 'Cargueiro Grande',
                        204: 'Caça Ligeiro',
                        205: 'Caça Pesado',
                        206: 'Cruzador',
                        207: 'Nave de Batalha',
                        208: 'Nave de Colonização',
                        209: 'Reciclador',
                        210: 'Sonda de Espionagem',
                        211: 'Bombardeiro',
                        212: 'Satélite Solar',
                        213: 'Destruidor',
                        214: 'Estrela da Morte',
                        215: 'Interceptador'
                    },
                    'defense': {
                        401: 'Lançador de Mísseis',
                        402: 'Laser Ligeiro',
                        403: 'Laser Pesado',
                        404: 'Canhão de Gauss',
                        405: 'Canhão de Íons',
                        406: 'Canhão de Plasma',
                        407: 'Pequeno Escudo Planetário',
                        408: 'Grande Escudo Planetário'
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
                    'round': {
                        'a_nb': 'Atacante dispara um total de ([\\d|\\.]*) tiros ',
                        'a_shoot': 'com uma força total de ([\\d|\\.]*)\.',
                        'd_bcl': 'Os escudos de defensor absorvem ([\\d|\\.]*) pontos de dano.',
                        'd_nb': 'Defensor dispara um total de ([\\d|\\.]*) tiros ',
                        'd_shoot': 'contra Atacante com uma força total de ([\\d|\\.]*)\.',
                        'a_bcl': ' Os escudos de atacante absorvem ([\\d|\\.]*) pontos de dano'
                    },
                    'result': {
                        'win': {
                            'win_metal': 'metal',
                            'win_cristal': 'cristal',
                            'win_deut': 'deutério'
                        },
                        'deb': {
                            'deb_metal': 'Metal',
                            'deb_cristal': 'Cristal'
                        },
                        'a_lost': 'O atacante perdeu um total de (.*) unidades.',
                        'd_lost': 'O defensor perdeu um total de (.*) unidades.'
                    },
                    'weapons': {
                        'arm': 'weaponPercentage',
                        'bcl': 'shieldPercentage',
                        'coq': 'armorPercentage'
                    },
                    'moon': 'formando assim uma lua',
                    'moonprob': 'A probabilidade de criação de lua através dos destroços foi de (\\d+) %',
                    'attack': 'Atacante',
                    'defense': 'Defensor',
                    'nul': 'match nul',
                    'attack_win': 'O atacante venceu a batalha!',
                    'ogameAPI_link': 'ogame-api'
                }
            },
            'messages': {
                'espionage of': 'Relatório de espionagem',
                'unespionage prob': 'Probabilidade de contra-espionagem',
                'activity': '(\\d+)</font> minutos',
                'moon': 'Lua',
                'espionnage action': 'Atividade de espionagem',
                'fleet command': 'Comando da frota',
                'expeditionResult': 'Resultado da expedição ',
                'fleet': 'Frota',
                'harvesting': 'Destroços reciclados em',
                'combat of': 'Relatório de combate',
                'combat defence': 'Batalha de',
                'trade message 1': 'Entrega de recursos para',
                'trade message 2': 'Chegada ao planeta',
                'antimatiere': 'antimatéria'
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
        'es': {
            'spy reports': {
                'groups': {
                    'resources': 'Recursos',
                    'buildings': 'Edificios',
                    'defense': 'Defensas',
                    'fleet': 'Flotas',
                    'researchs': 'Investigaciones',
                    'comment': 'Comentario'
                },
                'units': {
                    'resources': {
                        601: 'metal',
                        602: 'cristal',
                        603: 'deuterio',
                        604: 'energía'
                    },
                    'buildings': {
                        1: 'Mina de Metal',
                        2: 'Mina de Cristal',
                        3: 'Sintetizador de Deuterio',
                        4: 'Planta de Energía Solar',
                        12: 'Planta de Fusión',
                        14: 'Fábrica de Robots',
                        15: 'Fábrica de Nanobots',
                        21: 'Hangar',
                        22: 'Almacén de Metal',
                        23: 'Almacén de Cristal',
                        24: 'Depósito de Deuterio',
                        31: 'Laboratorio de Investigación',
                        33: 'Terraformer',
                        34: 'Depósito de Alianza',
                        36: 'Space Dock',
                        44: 'Silo de Misiles',
                        41: 'Base Lunar',
                        42: 'Sensor Phalanx',
                        43: 'Salto Cuântico'
                    },
                    'researchs': {
                        106: 'Tecnología de Espionaje',
                        108: 'Tecnología de Computación',
                        109: 'Tecnología Militar',
                        110: 'Tecnología de Defensa',
                        111: 'Tecnología de Blindaje',
                        113: 'Tecnología de Energía',
                        114: 'Tecnología de Hiperespacio',
                        115: 'Motor de Combustión',
                        117: 'Motor de Impulso',
                        118: 'Propulsor Hiperespacial',
                        120: 'Tecnología Láser',
                        121: 'Tecnología de Iónica',
                        122: 'Tecnología de Plasma',
                        123: 'Red de Investigación Intergaláctica',
                        124: 'Astrofísica',
                        199: 'Gravitón'
                    },
                    'fleet': {
                        202: 'Nave pequeña de carga',
                        203: 'Nave de carga grande',
                        204: 'Cazador Ligero',
                        205: 'Cazador Pesado',
                        206: 'Crucero',
                        207: 'Nave de Batalla',
                        208: 'Colonizador',
                        209: 'Reciclador',
                        210: 'Sonda de Espionaje',
                        211: 'Bombardero',
                        212: 'Satélite Solar',
                        213: 'Destructor',
                        214: 'Estrella de la Muerte',
                        215: 'Acorazado'
                    },
                    'defense': {
                        401: 'Lanzamisiles',
                        402: 'Láser Ligero',
                        403: 'Láser grande',
                        404: 'Canón Gauss',
                        405: 'Cañón de Iones',
                        406: 'Cañón de Plasma',
                        407: 'Cúpula pequeña de protección',
                        408: 'Cúpula grande de protección',
                        502: 'Mísiles antibalísticos',
                        503: 'Misil interplanetario'
                    },
                    'comment': {}
                },
                'ogameAPI_link': 'ogame-api'
            },
            'combat report': {
                'units': {
                    'fleet': {
                        202: 'Nave pequeña de carga',
                        203: 'Nave de carga grande',
                        204: 'Cazador Ligero',
                        205: 'Cazador Pesado',
                        206: 'Crucero',
                        207: 'Nave de Batalla',
                        208: 'Colonizador',
                        209: 'Reciclador',
                        210: 'Sonda de Espionaje',
                        211: 'Bombardero',
                        212: 'Satélite Solar',
                        213: 'Destructor',
                        214: 'Estrella de la Muerte',
                        215: 'Acorazado'
                    },
                    'defense': {
                        401: 'Lanzamisiles',
                        402: 'Láser pequeño',
                        403: 'Láser grande',
                        404: 'Canón Gauss',
                        405: 'Cañón de Iones',
                        406: 'Cañón de Plasma',
                        407: 'Cúpula pequeña de protección',
                        408: 'Cúpula grande de protección',
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
                    'round': {
                        'a_nb': 'El Atacante dispara un total de ([\\d|\\.]*) veces ',
                        'a_shoot': 'sobre el Defensor con una fuerza conjunta de ([\\d|\\.]*)\.',
                        'd_bcl': 'Los escudos del defensor absorben ([\\d|\\.]*) puntos de daño.',
                        'd_nb': 'El Defensor dispara un total de ([\\d|\\.]*) veces ',
                        'd_shoot': 'sobre el Atacante con una fuerza conjunta de ([\\d|\\.]*)\.',
                        'a_bcl': ' Los escudos del atacante absorben  ([\\d|\\.]*) puntos de daño.'
                    },
                    'result': {
                        'win': {
                            'win_metal': 'metal',
                            'win_cristal': 'cristal',
                            'win_deut': 'deuterio'
                        },
                        'deb': {
                            'deb_metal': 'Metal',
                            'deb_cristal': 'Cristal'
                        },
                        'a_lost': 'El atacante perdió un total de (.*) unidades.',
                        'd_lost': 'El defensor perdió un total de (.*) unidades.'
                    },
                    'weapons': {
                        'arm': 'Militar',
                        'bcl': 'Defensa',
                        'coq': 'Blindaje'
                    },
                    'moon': 'La probabilidad de crear ',
                    'moonprob': 'una luna de los escombros es de (\\d+) %',
                    'attack': 'Atacante',
                    'defense': 'Defensor',
                    'nul': 'match nul',
                    'attack_win': '¡El atacante ha ganado la batalla!',
                    'ogameAPI_link': 'ogame-api'
                }
            },
            'messages': {
                'espionage of': 'Informe de espionaje',
                'unespionage prob': 'Posibilidades de contra-espionaje: ',
                'activity': '(\\d+)</font> minutos',
                'moon': 'Luna',
                'espionnage action': 'Actividad de espionaje',
                'fleet command': 'Comando de flota',
                'expeditionResult': 'Resultado de la expedición ',
                'fleet': 'Flota',
                'harvesting': 'En estas coordenadas del espacio ahora flotan',
                'combat of': 'Informe de batalla',
                'combat defence': 'Batalla en',
                'trade message 1': 'Entrega de recursos',
                'trade message 2': 'Llegada a un planeta',
                'antimatiere': 'Materia Oscura'
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
		'it': {
			'spy reports': {
				'groups': {
					'resources': 'Risorse',
					'buildings': 'Strutture',
					'defense': 'Difese',
					'fleet': 'Flotta',
					'researchs': 'Ricerche',
					'comment': 'Commenti'
				},
				'units': {
					'resources': {
						601: 'Metallo',
						602: 'Cristallo',
						603: 'Deuterio',
						604: 'Energia'
					},
					'buildings': {
						1: 'Miniera di metallo',
						2: 'Miniera di cristallo',
						3: 'Sintetizzatore di deuterio',
						4: 'Centrale solare',
						12: 'Centrale a fusione',
						14: 'Fabbrica dei robot',
						15: 'Fabbrica dei naniti',
						21: 'Porto spaziale',
						22: 'Deposito di metallo',
						23: 'Deposito di cristallo',
						24: 'Deposito di deuterio',
						31: 'Laboratorio di ricerca',
						33: 'Terraformer',
						34: 'Base di appoggio',
                        36: 'Space Dock',
						44: 'Base missilistica',
						41: 'Avamposto lunare',
						42: 'Falange di sensori',
						43: 'Portale iperspaziale'
					},
					'researchs': {
						106: 'Teconologia per lo spionaggio',
						108: 'Tecnologia informatica',
						109: 'Tecnologia delle armi',
						110: 'Tecnologia degli scudi',
						111: 'Tecnologia delle corazze',
						113: 'Tecnologia energetica',
						114: 'Tecnologia iperspaziale',
						115: 'Propulsore a combustione',
						117: 'Propulsore ad impulso',
						118: 'Propulsore iperspaziale',
						120: 'Laser dei Laser',
						121: 'Ion ionica',
						122: 'Plasma del plasma',
						123: 'Rete interplanetaria di ricerca',
						124: 'Astrofisica',
						199: 'Tecnologia Gravitonica'
					},
					'fleet': {
						202: 'Cargo leggero',
						203: 'Cargo pesante',
						204: 'Caccia leggero',
						205: 'Caccia pesante',
						206: 'Incrociatore',
						207: 'Nave da battaglia',
						208: 'Colonizzatrice',
						209: 'Riciclatrice',
						210: 'Sonda spia',
						211: 'Bombardiere',
						212: 'Satellite solare ',
						213: 'Corazzata',
						214: 'Morte nera',
						215: 'Incrociatore da battaglia'
					},
					'defense': {
						401: 'Lanciamissili',
						402: 'Laser leggero',
						403: 'Laser pesante',
						404: 'Cannone di Gauss',
						405: 'Cannone ionico',
						406: 'Cannone al Plasma',
						407: 'Cupola scudo piccola',
						408: 'Cupola scudo potenziata',
						502: 'Missili anti balistici',
						503: 'Missili interplanetari'
					},
					'comment': {}
				},
				'ogameAPI_link': 'ogame-api'
			},
			'combat report': {
				'units': {
					'fleet': {
						202: 'Cargo leggero',
						203: 'Cargo pesante',
						204: 'Caccia leggero',
						205: 'Caccia pesante',
						206: 'Incrociatore',
						207: 'Nave da battaglia',
						208: 'Colonizzatrice',
						209: 'Riciclatrice',
						210: 'Sonda spia',
						211: 'Bombardiere',
						212: 'Satellite solare ',
						213: 'Corazzata',
						214: 'Morte nera',
						215: 'Incrociatore da battaglia'
					},
					'defense': {
						401: 'Lanciamissili',
						402: 'Laser leggero',
						403: 'Laser pesante',
						404: 'Cannone di Gauss',
						405: 'Cannone ionico',
						406: 'Cannone al Plasma',
						407: 'Cupola scudo piccola',
						408: 'Cupola scudo potenziata'
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
					'round': {
						'a_nb': 'Attaccante spara per un totale di ([\\d|\\.]*) volte ',
						'a_shoot': 'con una potenza di fuoco di ([\\d|\\.]*) sul Difensore.',
						'd_bcl': 'Gli scudi del Difensore assorbono ([\\d|\\.]*) punti danno.',
						'd_nb': 'Il Difensore spara per un totale di ([\\d|\\.]*) volte',
						'd_shoot': 'con una potenza di fuoco di ([\\d|\\.]*)\ sul Attaccante',
						'a_bcl': 'Gli scudi del Attaccante assorbono ([\\d|\\.]*) punti danno'
					},
					'result': {
						'win': {
							'win_metal': 'Metallo',
							'win_cristal': 'Cristallo',
							'win_deut': 'Deuterio'
						},
						'deb': {
							'deb_metal': 'Metallo',
							'deb_cristal': 'Cristallo'
						},
						'a_lost': 'Attaccante ha perso un totale di (.*) unità.',
						'd_lost': 'Difensore ha perso un totale di	(.*) unità.'
					},
					'weapons': {
						'arm': 'weaponPercentage',
						'bcl': 'shieldPercentage',
						'coq': 'armorPercentage'
					},
					'moon': 'formano una luna',
					'moonprob': 'la probabilità di creazione di una luna è del (\\d+) %',
					'attack': 'Attaccante',
					'defense': 'Difensore',
					'nul': 'Parità',
					'attack_win': 'Attaccante vince la battaglia',
					'ogameAPI_link': 'ogame-api'
				}
			},
			'messages': {
				'espionage of': 'Rapporto di spionaggio di',
				'unespionage prob': 'Probabilità di controspionaggio',
				'activity': 'ultimi (\\d+)</font> minuti',
				'moon': 'Luna',
				'espionnage action': 'Spia',
				'fleet command': 'Attacca',
				'expeditionResult': 'Risultato della spedizione',
				'fleet': 'Flotta',
				'harvesting': 'Rapporto di riciclaggio',
				'combat of': 'Rapporto di combattimento',
				'combat defence': 'Attacco da',
				'trade message 1': 'risorse consegnate da una flotta straniera',
				'trade message 2': 'Pianeta raggiunto',
				'antimatiere': 'Materia oscura'
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
		}
	})
}
