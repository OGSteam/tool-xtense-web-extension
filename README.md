# Xtense Browser Addon for OGSpy

This is the source code used to build Mozilla and Chrome extensions.

[![GitHub issues](https://img.shields.io/github/issues/OGSteam/tool-xtense-web-extension.svg?style=flat-square)](https://github.com/OGSteam/tool-xtense-web-extension/issues)
[![GitHub forks](https://img.shields.io/github/forks/OGSteam/tool-xtense-web-extension.svg?style=flat-square)](https://github.com/OGSteam/tool-xtense-web-extension/network)
[![GitHub stars](https://img.shields.io/github/stars/OGSteam/tool-xtense-web-extension.svg?style=flat-square)](https://github.com/OGSteam/tool-xtense-web-extension/stargazers)
[![GitHub license](https://img.shields.io/badge/license-GPLv2-blue.svg?style=flat-square)](https://raw.githubusercontent.com/OGSteam/tool-xtense-web-extension/master/LICENSE)

* [![Mozilla Add-on](https://img.shields.io/amo/v/xtense-we.svg?style=flat-square)](https://addons.mozilla.org/fr/firefox/addon/xtense-we) [![Mozilla Add-on](https://img.shields.io/amo/d/xtense-we.svg?style=flat-square)](https://addons.mozilla.org/fr/firefox/addon/xtense-we)
* [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/mkcgnadlbcakpmmmdfijdekknodapcgl.svg?style=flat-square)](https://chrome.google.com/webstore/detail/xtense-gm/mkcgnadlbcakpmmmdfijdekknodapcgl) [![Chrome Web Store](https://img.shields.io/chrome-web-store/d/mkcgnadlbcakpmmmdfijdekknodapcgl.svg?style=flat-square)](https://chrome.google.com/webstore/detail/xtense-gm/mkcgnadlbcakpmmmdfijdekknodapcgl)

## Team

* [DarkNoon](https://github.com/darknoon29)
* [Jedinight](https://github.com/jedi-night)
* Superbox
* [Itori](https://github.com/Itori)
* [Roms0406](https://github.com/Roms0406)

## NPM Scripts

Pré Requis :

* [Mozilla Firefox Dev Edition](https://www.mozilla.org/fr/firefox/channel/desktop/)
* NodeJS

Premier lancement : Lancer la commande ``npm install``

* ``npm run version`` : Mise à jour des versions dans les fichiers manifest (Référence Package.json)
* ``npm run clean`` : Suppression des anciennes versions
* ``npm run build`` : Copy JS dependencies to extension folder
* ``npm run release`` : Contruit les packages zip de l'extension à destination des stores Chrome et Mozilla
* ``npm run dev`` : lance le navigateur Web avec l'extension chargée en vue des tests
* ``npm run lint`` : Passe le script de certification Mozilla et remonte les problèmes détectés
* ``npm test`` : Exécute les tests locaux sans connexion à OGame

## Scanner d’anomalies

Le niveau du scanner n’est pas encore transmis à OGSpy. Le DOM fictif des tests
place la technologie `45` après le dock spatial, mais ce sélecteur et sa position
doivent être confirmés sur une page OGame réelle avant leur utilisation.

Le [contrat des bâtiments du mod Xtense](https://github.com/OGSteam/mod-xtense/blob/8deecba1786526167c9d6a2458a54f98f39e7ec3/includes/config.php)
ne définit pas de champ pour le scanner ; le [traitement serveur](https://github.com/OGSteam/mod-xtense/blob/8deecba1786526167c9d6a2458a54f98f39e7ec3/xtense.php)
n’enregistre que les champs de cette liste. Il faut d’abord convenir d’un nom de
champ, l’ajouter au contrat du mod et prévoir son stockage et sa migration dans
OGSpy, ainsi que des tests serveur. Ensuite, l’extension pourra extraire le niveau
par son identifiant et l’envoyer seulement lorsqu’il est présent, sans décaler
les autres installations ni modifier les lunes.

## Branches de travail

* master - Branche Principale, utilisée uniquement pour publier les versions finales de nos outils.
* development - branche qui contient les développements pour les futures versions

## Journal

Le journal est assuré par la librairie [LogLevel](https://github.com/pimterry/loglevel)

Il existe 5 niveaux de Logs:

* log.trace(msg) : Affiche le Log et la Callstack
* log.debug(msg) : Niveau par défaut en mode Debug : Affiche les données envoyées aisni que les étapes intermédiaires
* log.info(msg) : Niveau par défaut en mode normal : Affiche les pages détectée et le résultat de l'envoi
* log.warn(msg) : Pour alerter l'utilisateur d'un Problème
* log.error(msg) : : Pour alerter l'utilisateur d'une Erreur

## Outils

[XPath Help](https://devhints.io/xpath)

## Contact

* [Forum](https://forum.ogsteam.eu)
