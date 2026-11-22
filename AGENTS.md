# Instructions pour les agents

## Mission et architecture

- Xtense est une extension navigateur Manifest V3 qui lit le DOM d’OGame et transmet les données de jeu à OGSpy.
- Le content script principal est `extension/xtense.user.js`. Il initialise la communication, les parsers, les locales, l’interface et le traitement de la page courante.
- `extension/parsers/controller.js` route les pages et observe les mises à jour dynamiques du DOM. Les parsers métier se trouvent dans `extension/parsers/pages.js`, `messages.js` et `metas.js`; les XPath communs sont dans `extension/parsers/OgameConstants.js`.
- Les données préparées par les parsers passent par `XtenseRequest` dans `extension/ogspy/send_data.js`. `Xajax` dans `extension/utilities.js` transmet la requête au service worker `extension/background-service.js`, qui vérifie l’origine puis effectue le `fetch`.
- L’interface de configuration OGame est dans `extension/ui/menu_item.js`. La popup `extension/xtense.html` et `extension/ui/popup.js` gèrent notamment les permissions hôte.

## Envoi des données au mod Xtense d’OGSpy

- Les parsers renseignent `XtenseRequest.data` avec un `type` et des données `gamedata`, via `XtenseRequest.set()` dans `extension/ogspy/send_data.js`, puis déclenchent `XtenseRequest.send()`.
- La requête principale est un POST JSON vers `${serverUrl}/mod/xtense/xtense.php`. Le corps contient `toolbar_version`, `toolbar_type`, `mod_min_version`, `univers`, `type`, `password` et `data`; `data` est une chaîne JSON de `gamedata`. Le mot de passe ne doit jamais être ajouté aux logs en clair.
- `XtenseRequest.send()` valide l’URL serveur avant l’envoi. Le content script ne fait pas directement le `fetch` : `Xajax` envoie un message `xhttp` au service worker avec `Content-Type: text/plain; charset=UTF-8`; `extension/background-service.js` vérifie l’origine configurée et effectue le POST (avec un délai maximal de 10 secondes).
- Le service worker renvoie le statut HTTP et le texte de réponse au content script via `xhttp_response`. `Xajax` appelle ensuite `handleResponse()` dans `send_data.js`, qui interprète la réponse du mod et met à jour le statut de l’extension. Toute modification du format doit rester compatible avec le mod Xtense côté OGSpy et ce chemin de retour.
- Si `backup.link` est activé, une requête séparée est envoyée au serveur de secours avec son URL et son mot de passe propres. Le code actuel sérialise `this.data` dans le champ `data` du paquet de secours, contrairement à `gamedata` pour le serveur principal : vérifier le contrat attendu avant de modifier ce comportement.

## Invariants à préserver

- Les scripts du content script utilisent des variables globales et sont chargés dans un ordre défini par les manifests. Préserver cet ordre dans `extension/manifest.json`, `manifest.chrome.json` et `manifest.firefox.json`; ne pas ajouter d’import/export ESM aux scripts injectés sans refonte cohérente de leur chargement.
- Pour modifier un script chargé ou une permission, examiner `extension/manifest.json`, `extension/manifest.chrome.json` et `extension/manifest.firefox.json`, en respectant les différences propres aux navigateurs.
- Les préférences du content script sont lues et écrites avec `storageGetValue`/`storageSetValue` dans `extension/utilities.js`. Leurs clés sont préfixées par la langue et l’univers dans `extension/xtense.user.js`. Lorsqu’une option change, aligner son identifiant, sa lecture, son écriture et tous ses consommateurs, notamment dans `menu_item.js` et les parsers.
- Ne pas confondre ce stockage avec `chrome.storage.local`, que le service worker consulte pour vérifier les origines des serveurs configurés. L’accès réseau est également soumis aux permissions d’hôte du navigateur.
- Les parsers doivent rester compatibles avec le DOM dynamique d’OGame et éviter les traitements en double. Centraliser les sélecteurs XPath partagés dans `OgameConstants.js`.
- Garder les messages d’erreur et statuts visibles via les mécanismes existants (`log`, `setStatus`, `handleResponse`); ne pas masquer une erreur réseau ou de parsing.

## Parsing et DOM observé

- Le classement utilise `component=highscore`. Pour le classement militaire, le nombre de vaisseaux est dans `data-tooltip-title` de la cellule de score; le parseur accepte aussi l’ancien attribut `title`.
- La page Messages observée utilise `#messagescomponent`, puis `#messages` avec `tabsWrapper` et `messagesHolder`. L’ancien conteneur reste pris en charge. L’observateur doit traiter les messages déjà présents et ceux ajoutés pendant le délai entre deux parsings.
- Les messages courts sont dédupliqués par identifiant. Les rapports de combat et d’espionnage utilisent les attributs de `.rawMessageData`; pour le contre-espionnage, lire `data-raw-counterespionagechance` avant la cellule affichée.
- Les parsers de Recherche, Installations, Ressources et Défense associent les niveaux aux champs par ordre d’apparition. Vérifier cet ordre et les XPath avant de modifier leur mapping.
- Le scanner d’anomalies apparaît dans les Installations mais n’est pas transmis par `parse_station()`. Vérifier le contrat du mod OGSpy avant d’ajouter ce champ.

## Développement et validation

- Node.js `>=22` est requis (`package.json`).
- `npm install` installe les dépendances.
- `npm run build` copie jQuery et loglevel vers `extension/contribs`.
- `npm run lint` lance ESLint et `web-ext lint`.
- `npm run version` synchronise la version des trois manifests et les en-têtes JavaScript; ne l’utiliser que pour une mise à jour de version.
- `npm run release` prépare les dossiers Chrome, Firefox et Edge dans `release/`; la génération des archives ZIP est distincte.
- `npm run dev-firefox` lance l’extension dans Firefox pour le développement.
- `npm test` exécute les fichiers `tests/*.test.js` avec `node:test` et jsdom. Les tests utilisent des DOM et données fictifs ainsi qu’un transport simulé, sans connexion au jeu.
- Pour cibler un test, utiliser par exemple `node --test tests/messages.test.js`. Ne pas lancer `node --test` sans filtre : cela découvre aussi `project/test-ogspy-server.mjs`, qui envoie une requête à un serveur OGSpy.
- Les tests couvrent notamment le routage du classement, les niveaux, la galaxie et certains messages courts. Ils ne valident pas l’envoi réel à OGSpy ni tous les types ou détails de messages.
- Pour une modification, exécuter les tests pertinents, le lint pertinent et le build si les fichiers ou leur packaging sont concernés. `npm run lint` s’arrête si ESLint échoue; utiliser `npm run lint:ext` séparément pour vérifier le manifest.

## Documentation utile

- `docs/message-debug-mode.md` décrit `enableMessageDebug()` et `disableMessageDebug()` pour diagnostiquer le parsing des messages.
- `docs/chrome-refresh-token-setup.md` documente la configuration du renouvellement du jeton Chrome Store.
- Se fier à l’arborescence réelle `extension/`, aux manifests et aux scripts de `package.json` plutôt qu’à une description de structure qui ne correspondrait pas au dépôt.
