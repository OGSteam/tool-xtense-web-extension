# AGENTS.md

## Objectif rapide
- Extension navigateur MV3 pour OGame: parser le DOM du jeu puis envoyer des paquets JSON vers OGSpy (`extension/parsers/*` -> `extension/ogspy/send_data.js`).
- Le code runtime est **legacy global-scope** (pas de modules côté content script): l'ordre des scripts dans `extension/manifest*.json` est contractuel.

## Carte architecture (lire dans cet ordre)
- Entrée content script: `extension/xtense.user.js` (init: `initOGSpyCommunication()`, `initParsers()`, `initLocales()`, `handle_current_page()`).
- Routage des pages OGame: `extension/parsers/controller.js` (`handle_current_page`, `get_content`, MutationObserver).
- Parsers métier: `extension/parsers/pages.js`, `extension/parsers/messages.js`, `extension/parsers/metas.js`.
- Transport OGSpy: `extension/ogspy/send_data.js` (`XtenseRequest.set/send`, `handleResponse`).
- Bridge réseau MV3: `extension/utilities.js` (`Xajax`) <-> `extension/background-service.js` (fetch + allowlist d'origines).
- UI extension: menu injecté dans OGame via `extension/ui/menu_item.js`; popup permissions via `extension/xtense.html` + `extension/ui/popup.js`.

## Flux de données critique
- Chaque parser prépare `type` + `gamedata`, puis appelle `XtenseRequest.send()`.
- `send()` poste sur `${serverUrl}/mod/xtense/xtense.php` (et optionnellement backup) avec `Content-Type: text/plain; charset=UTF-8`.
- `Xajax` n'utilise pas `fetch` direct en content script: message `chrome.runtime.sendMessage({action:"xhttp"})` vers service worker.
- Réponse renvoyée au tab via `xhttp_response`, puis `handleResponse(status, text)` traduit en statut UI/localisé.

## Conventions projet (spécifiques)
- Préférences stockées dans `localStorage` avec préfixe univers/langue (`prefix_GMData` dans `extension/xtense.user.js`).
- Les booléens sont souvent persistés en string (`"true"/"false"`) et comparés via `.toString() === "true"`.
- Anti-duplication en parsing via clé `lastAction` (ex: `s:galaxy:system`, `r:type:subtype:offset`).
- Parsing OGame repose fortement sur XPath centralisés dans `extension/parsers/OgameConstants.js` (`XtenseXpaths`).
- Lint accepte explicitement des globals legacy (`eslint.config.js`): éviter d'introduire des imports ESM dans `extension/**/*.js` sans refonte globale.

## Workflows dev utiles
- Installer/build: `npm install`, puis `npm run build` (copie `jquery/loglevel` vers `extension/contribs`).
- Synchroniser versions manifest + headers: `npm run version`.
- Package release stores: `npm run release` (sorties dans `release/{chrome,firefox,edge}` + zips).
- Dev Firefox: `npm run dev-firefox` (script `project/dev-firefox.mjs`, gère les chemins réels Windows/jonctions).
- Lint JS + extension: `npm run lint:all`.

## Intégrations externes et pièges
- Permissions hôtes: base `localhost` + permissions optionnelles `https://*/*`/`http://*/*` demandées via popup (`extension/ui/popup.js`).
- Service worker bloque les origines non allowlistées (`background-service.js`): OGame + origines des serveurs configurés.
- Pour diagnostiquer OGSpy sans navigateur: `node project/test-ogspy-server.mjs [serverUrl] [password]`.
- Debug messages OGame: `enableMessageDebug()`/`disableMessageDebug()` (voir `docs/message-debug-mode.md`, `extension/parsers/message-debug.js`).

## Notes de contribution pour agents IA
- Vérifier les 3 manifests (`extension/manifest.json`, `extension/manifest.chrome.json`, `extension/manifest.firefox.json`) lors de changements de scripts/permissions.
- Si vous ajoutez une nouvelle clé de config, aligner lecture/écriture + UI options (`menu_item.js`) + comportement parser.
- `extension/README.md` décrit une structure `src/` non alignée avec le dépôt actuel: se fier au layout réel `extension/*.js`, `extension/parsers/*`, `extension/ui/*`.

