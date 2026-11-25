# Instructions pour les agents

## Mission et architecture

- Xtense est une extension navigateur Manifest V3 qui lit le DOM d’OGame et transmet les données de jeu à OGSpy.
- Le content script principal est `extension/xtense.user.js`. Il initialise la communication, les parsers, les locales, l’interface et le traitement de la page courante.
- `extension/parsers/controller.js` route les pages et observe les mises à jour dynamiques du DOM. Les parsers métier se trouvent dans `extension/parsers/pages.js`, `messages.js` et `metas.js`; les XPath communs sont dans `extension/parsers/OgameConstants.js`.
- Les données préparées par les parsers passent par `XtenseRequest` dans `extension/ogspy/send_data.js`. `Xajax` dans `extension/utilities.js` transmet la requête au service worker `extension/background-service.js`, qui valide la destination puis effectue le `fetch`.
- L’interface de configuration OGame est dans `extension/ui/menu_item.js`. La popup `extension/xtense.html` et `extension/ui/popup.js` gèrent notamment les permissions hôte accordées à l’exécution.

## Envoi des données au mod Xtense d’OGSpy

- Les parsers renseignent `XtenseRequest.data` avec un `type` et des données `gamedata`, via `XtenseRequest.set()` dans `extension/ogspy/send_data.js`, puis déclenchent `XtenseRequest.send()`.
- La requête principale est un POST JSON vers `${serverUrl}/mod/xtense/xtense.php`. Le corps contient `toolbar_version`, `toolbar_type`, `mod_min_version`, `univers`, `type`, `password` et `data`; `data` est une chaîne JSON de `gamedata`.
- `XtenseRequest.send()` valide l’URL avec `validateServerUrl()` avant l’envoi. Le content script ne fait pas directement le `fetch` : `Xajax` envoie un message `xhttp` au service worker avec `Content-Type: text/plain; charset=UTF-8`.
- Le service worker reconstruit la liste des endpoints exacts autorisés à partir des profils stockés dans `chrome.storage.local`. Seul `${serverUrl}/mod/xtense/xtense.php` est accepté; autoriser une origine ne doit pas autoriser un autre chemin sur cette origine.
- Les serveurs OGSpy distants doivent utiliser HTTPS. HTTP n’est accepté que pour `localhost` et `127.0.0.1`, ports non standard compris. Les redirections réseau sont refusées avec `redirect: 'error'` et la requête est limitée à 10 secondes.
- Le service worker vérifie également que la permission hôte du navigateur a été accordée, puis renvoie le statut HTTP et le texte de réponse via `xhttp_response`. `Xajax` appelle `handleResponse()` dans `send_data.js`, qui interprète la réponse du mod et met à jour le statut de l’extension.
- Ne jamais écrire les mots de passe, le contenu intégral des réponses serveur ou la liste des origines accordées dans les logs. Conserver en revanche les erreurs et statuts utiles via `log`, `setStatus` et `handleResponse`.
- Toute modification du format doit rester compatible avec le mod Xtense côté OGSpy et avec ce chemin de retour.
- Si `backup.link` est activé, une requête séparée est envoyée au serveur de secours avec son URL et son mot de passe propres. Le code actuel sérialise `this.data` dans le champ `data` du paquet de secours, contrairement à `gamedata` pour le serveur principal : vérifier le contrat attendu avant de modifier ce comportement.

## Permissions hôte et manifests

- Les trois manifests ne doivent pas déclarer de `host_permissions` obligatoires pour OGSpy. Les permissions restent dans `optional_host_permissions` avec uniquement `https://*/*`, `http://localhost/*` et `http://127.0.0.1/*`.
- La popup demande à l’exécution la permission correspondant au serveur principal configuré et, seulement si la sauvegarde est activée, au serveur de secours. Ne pas réintroduire `http://*/*` ni demander une permission générique quand la configuration est absente ou invalide.
- Pour modifier un script chargé ou une permission, examiner ensemble `extension/manifest.json`, `extension/manifest.chrome.json` et `extension/manifest.firefox.json`, en respectant les différences propres aux navigateurs.
- Toute évolution de la politique réseau doit conserver les trois couches de contrôle : validation de l’URL dans le content script, permission hôte du navigateur et endpoint exact dans le service worker.

## Invariants à préserver

- Les scripts du content script utilisent des variables globales et sont chargés dans un ordre défini par les manifests. Préserver cet ordre; ne pas ajouter d’import/export ESM aux scripts injectés sans refonte cohérente de leur chargement.
- Les globals du content script sont déclarées dans `eslint.config.js`. Ne déclarer chaque identifiant qu’une fois; `URL` et `url` sont cependant deux identifiants JavaScript distincts.
- Les préférences du content script sont lues et écrites avec `storageGetValue`/`storageSetValue` dans `extension/utilities.js`. Leurs clés sont préfixées par la langue et l’univers dans `extension/xtense.user.js`. Lorsqu’une option change, aligner son identifiant, sa lecture, son écriture et tous ses consommateurs, notamment dans `menu_item.js` et les parsers.
- Ne pas confondre ce stockage avec `chrome.storage.local`, que le service worker consulte pour établir ses endpoints autorisés. L’accès réseau reste également soumis aux permissions d’hôte du navigateur.
- Les parsers doivent rester compatibles avec le DOM dynamique d’OGame et éviter les traitements en double. Centraliser les sélecteurs XPath partagés dans `OgameConstants.js`.
- Garder les messages d’erreur et statuts visibles via les mécanismes existants; ne pas masquer une erreur réseau ou de parsing.

## Parsing et DOM observé

- Le classement utilise `component=highscore`. Pour le classement militaire, le nombre de vaisseaux est dans `data-tooltip-title` de la cellule de score; le parseur accepte aussi l’ancien attribut `title`.
- La page Messages observée utilise `#messagescomponent`, puis `#messages` avec `tabsWrapper` et `messagesHolder`. L’ancien conteneur reste pris en charge. L’observateur doit traiter les messages déjà présents et ceux ajoutés pendant le délai entre deux parsings.
- Les messages courts sont dédupliqués par identifiant. Les rapports de combat et d’espionnage utilisent les attributs de `.rawMessageData`; pour le contre-espionnage, lire `data-raw-counterespionagechance` avant la cellule affichée.
- Les parsers de Recherche, Installations, Ressources et Défense associent les niveaux aux champs par ordre d’apparition. Vérifier cet ordre et les XPath avant de modifier leur mapping.
- `getResources()` ajoute `population` et `food` au paquet `resources` de l’overview uniquement lorsque les compteurs correspondants existent dans le DOM. Ne pas envoyer de zéros inventés lorsque la planète n’expose pas les Formes de vie.
- L’espèce active est envoyée sous le champ optionnel `species` avec l’une des valeurs `HUMANS`, `ROCKTAL`, `MECHAS` ou `KAELESH`. Elle est détectée par la classe `lifeform1` à `lifeform4`, avec un repli sur le groupe des identifiants de bâtiments; omettre le champ si la détection est absente ou ambiguë.
- `species` est actuellement ajouté aux paquets `overview` et `lf_buildings`. Préserver le caractère optionnel de ce champ pour les pages et anciennes configurations où l’espèce n’est pas disponible.
- Le scanner d’anomalies est transmis par `parse_station()` sous le champ optionnel `Scanner` lorsqu’il apparaît après `Dock` sur une planète. Son absence ne doit pas décaler le mapping, et le mapping des installations lunaires doit rester inchangé.
- Le mod Xtense côté OGSpy ne définit pas encore `Scanner` dans son contrat et ignore donc actuellement cette valeur. Ne pas considérer l’envoi comme une prise en charge serveur complète; toute exploitation nécessite une évolution et une migration côté mod/OGSpy.

## Développement et validation

- `package.json` déclare Node.js `>=22`, mais les dépendances actuelles telles que jsdom/undici demandent en pratique Node `>=22.22.2`; utiliser de préférence Node 26, comme les workflows CI. Un Node 22 plus ancien peut installer avec `EBADENGINE` puis faire échouer les tests.
- `npm install` installe les dépendances en local. Les workflows CI et de publication utilisent `npm ci --ignore-scripts` pour une installation reproductible sans scripts de cycle de vie.
- `npm run build` copie jQuery et loglevel vers `extension/contribs`.
- `npm run lint` lance ESLint puis `web-ext lint`; utiliser `npm run lint:ext` séparément pour diagnostiquer le manifest et le linter Mozilla.
- Le projet utilise ESLint 10 directement. `web-ext@10.8.0` dépend toutefois de `addons-linter@10.14.0`, qui impose encore `eslint@9.39.4` et peut afficher un avertissement de version non supportée pendant l’installation. Ne pas forcer ESLint 10 avec un `overrides` npm : `addons-linter` utilise `configType: 'eslintrc'`, incompatible avec ESLint 10. Vérifier une nouvelle version amont avant de modifier ce point.
- `npm run version` synchronise la version des trois manifests et les en-têtes JavaScript; ne l’utiliser que pour une mise à jour de version.
- `npm run release` prépare les dossiers Chrome, Firefox et Edge dans `release/`; la génération des archives ZIP est distincte.
- `npm run dev-firefox` lance l’extension dans Firefox pour le développement. `project/dev-firefox.mjs` doit exécuter le CLI local `web-ext` via `process.execPath`, sans rechercher `npx` dans `PATH` ni activer `shell: true`.
- `npm test` exécute uniquement `tests/*.test.js` avec `node:test` et jsdom. Les tests utilisent des DOM et données fictifs ainsi qu’un transport simulé, sans connexion au jeu.
- Pour cibler un test, utiliser par exemple `node --test tests/messages.test.js`. Ne pas lancer `node --test` sans filtre : cela découvre aussi `project/test-ogspy-server.mjs`, qui envoie une requête à un serveur OGSpy.
- Les tests couvrent notamment les permissions réseau, la validation des URL, les manifests, le routage du classement, les niveaux, la galaxie, population/nourriture/espèce, le scanner et certains messages courts. Ils ne valident pas l’envoi réel à OGSpy ni tous les types ou détails de messages.
- Pour une modification, exécuter les tests pertinents, le lint pertinent et le build si les fichiers ou leur packaging sont concernés. Terminer par `git diff --check`.

## CI, SonarCloud et chaîne de publication

- Les actions GitHub tierces sont épinglées sur des SHA complets avec un commentaire indiquant leur version. Conserver cet épinglage; pour une mise à jour, vérifier que le SHA correspond au tag officiel avant de le remplacer.
- Ne pas remplacer `npm ci --ignore-scripts` par `npm install` dans les workflows. Cela réintroduirait l’exécution de scripts de cycle de vie et un hotspot SonarCloud.
- Éviter les exécutables résolus depuis un `PATH` modifiable dans les scripts Node sensibles; préférer un chemin local déterministe et `process.execPath`.
- `.github/workflows/sonarcloud.yml` exécute les tests avec couverture puis l’analyse SonarCloud sur `develop`, `master` et les pull requests. Vérifier le Quality Gate ainsi que les Security Hotspots après toute modification de workflow ou de sécurité.
- `.github/workflows/build-and-test.yml` s’exécute sur `develop`, construit les archives, crée une release brouillon de test et peut publier la bêta Chrome. Traiter toute modification de ce workflow comme une opération de déploiement sensible.
- `.github/workflows/publish-release.yml` s’exécute sur `master` et publie la release ainsi que les extensions Chrome, Firefox et Edge. Ne pas merger une release sans avoir vérifié la version, les secrets attendus, les artefacts et les contrôles CI.
- Pour une release, préparer une PR `develop` vers `master` intitulée `Release X.Y.Z`. Les notes doivent couvrir les fonctionnalités, la sécurité, la maintenance, les incompatibilités et les validations.
- Mentionner explicitement dans les notes de release toute rupture pertinente, notamment l’obligation HTTPS pour les serveurs OGSpy distants. Mentionner aussi les dépendances serveur, comme le fait que `Scanner` reste ignoré tant que le mod Xtense ne le prend pas en charge.

## Documentation utile

- `docs/message-debug-mode.md` décrit `enableMessageDebug()` et `disableMessageDebug()` pour diagnostiquer le parsing des messages.
- `docs/chrome-refresh-token-setup.md` documente la configuration du renouvellement du jeton Chrome Store.
- `README.md` décrit la limitation serveur actuelle du scanner d’anomalies.
- Se fier à l’arborescence réelle `extension/`, aux manifests, aux workflows et aux scripts de `package.json` plutôt qu’à une description de structure qui ne correspondrait pas au dépôt.
