# Mode Debug pour le Parsing des Messages Xtense

## Introduction

Le mode debug pour le parsing des messages permet d'analyser systématiquement tous les messages dans OGame pour diagnostiquer les problèmes de parsing et comprendre la structure DOM.

## Activation du Mode Debug

### Via la Console du Navigateur

1. **Ouvrir la console** : `F12` → onglet `Console`
2. **Activer le debug** :
   ```javascript
   enableMessageDebug()
   ```
3. **Aller à la page des messages** dans OGame
4. **Observer les logs détaillés** dans la console

### Désactivation du Mode Debug

```javascript
disableMessageDebug()
```

## Fonctionnalités du Mode Debug

### 🔍 Analyse Automatique

Quand le mode debug est activé, le système analyse automatiquement :

- **Structure DOM** de chaque message
- **Attributs data-*** disponibles
- **Contenu textuel** des messages
- **Éléments spéciaux** (rawMessageData, msgFilteredHeaderCell, etc.)
- **Tests de correspondance** pour tous les types de messages

### 📧 Informations Collectées

Pour chaque message, le debug affiche :

- **Classes CSS** du message
- **ID** du message
- **Tous les attributs data-*** et leurs valeurs
- **Contenu textuel** (premiers 100 caractères)
- **Nombre d'éléments** par type (.rawMessageData, .msg_content, etc.)

### 🧪 Tests de Types de Messages

Le système teste automatiquement si chaque message correspond à :

- ✅ **Espionnage ennemi**
- ✅ **Recyclage**
- ✅ **Expédition**
- ✅ **Espionnage**
- ✅ **Combat**

### 📊 Données XPath

Le debug affiche les XPath utilisés et leurs résultats :

- `showmessage` : Messages détaillés/étendus
- `shortmessages` : Messages courts/liste
- Nombre de messages trouvés pour chaque XPath

## Avantages du Mode Debug

### ✅ Forçage du Retraitement

En mode debug :
- **Tous les messages sont retraités** à chaque fois
- **Pas de cache** des messages déjà traités
- **Réinitialisation automatique** des compteurs

### ✅ Logs Détaillés

- **Groupes console** pour une lecture claire
- **Émojis** pour identifier rapidement les types d'informations
- **Données structurées** pour l'analyse

### ✅ Diagnostic Complet

- **Identification des problèmes** de regex
- **Vérification des XPath**
- **Analyse de la structure DOM** réelle

## Exemples d'Utilisation

### Diagnostiquer pourquoi un message n'est pas reconnu

1. Activer le mode debug
2. Aller aux messages
3. Chercher dans la console le message concerné
4. Vérifier les tests de correspondance (✅ ou ❌)
5. Examiner le contenu textuel et les locales disponibles

### Vérifier les XPath

1. Activer le mode debug
2. Observer les logs "Résultats XPath"
3. Vérifier si les nombres correspondent à la réalité

### Analyser la structure d'un nouveau type de message

1. Activer le mode debug
2. Examiner l'analyse de structure complète
3. Identifier les attributs data-raw-* disponibles
4. Adapter le code de parsing selon les données trouvées

## Logs Types

### 🐛 DEBUG
```
🐛 DEBUG: XPath showmessage: //div[...]
🐛 DEBUG: Début du traitement des messages courts
```

### 📧 Analyse de Message
```
📧 Analyse du message 1
  Node: <div class="msg msgWithFilter">
  Classes: msg msgWithFilter collapsible
  Attributs data-*:
    data-msg-id: 29088854
    data-messages-filters-playername: DarkNoon
```

### 🔍 Debug Parsing
```
🔍 Debug parsing message 29088854
  Contenu du message: Espionnage de DarkNoon...
  Tests de correspondance:
    Espionnage ennemi: ❌
    Espionnage: ✅
```

## Notes Importantes

- **Performance** : Le mode debug est plus lent car il traite tous les messages
- **Logs** : Beaucoup d'informations dans la console
- **Retraitement** : En mode debug, les messages sont toujours retraités
- **Désactivation** : Pensez à désactiver le mode debug après usage

## Commandes Rapides

```javascript
// Activer le debug
enableMessageDebug()

// Désactiver le debug
disableMessageDebug()

// Log debug manuel (seulement si mode debug activé)
debugLog("Mon message de debug")
debugLog("Message avec données", {ma: "donnée"})
```

## Troubleshooting

### Si le mode debug ne fonctionne pas

1. Vérifier que vous êtes sur une page de messages OGame
2. Recharger la page après activation
3. Vérifier les erreurs dans la console
4. S'assurer que l'extension Xtense est bien chargée

### Si trop de logs

1. Filtrer la console par "🐛 DEBUG"
2. Utiliser les groupes de console (petites flèches)
3. Désactiver temporairement le debug

Ce mode debug permet une analyse complète et systématique de tous les aspects du parsing des messages dans Xtense.
