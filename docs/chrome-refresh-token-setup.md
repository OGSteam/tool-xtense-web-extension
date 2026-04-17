# Guide : Obtenir le Refresh Token Chrome Web Store

## Prérequis

Avant de commencer, vous devez avoir :
- Un compte développeur Chrome Web Store
- Une extension publiée sur le Chrome Web Store
- Les credentials OAuth de votre projet Google Cloud

## Étape 1 : Configuration du projet Google Cloud

### 1.1 Créer/Configurer le projet
1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Chrome Web Store :
   - Allez dans "APIs & Services" > "Enabled APIs & services"
   - Cliquez sur "+ ENABLE APIS AND SERVICES"
   - Recherchez "Chrome Web Store API"
   - Cliquez sur "Enable"

### 1.2 Créer les credentials OAuth
1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "+ CREATE CREDENTIALS" > "OAuth client ID"
3. Sélectionnez "Desktop application" comme type d'application
4. Donnez un nom à votre client OAuth (ex: "Xtense Chrome Extension Publisher")
5. Cliquez sur "Create"
6. **Notez votre Client ID et Client Secret** - vous en aurez besoin

## Étape 2 : Valider l'application OAuth (Publishing status → Production)

> ⚠️ **Obligatoire** : En mode "Testing", les refresh tokens expirent après **7 jours**. Il faut passer l'application en **"In production"** pour obtenir des tokens valables jusqu'à 6 mois.

### 2.1 Publier l'application OAuth
1. Allez sur https://console.cloud.google.com/
2. Sélectionnez votre projet
3. Menu gauche → **"APIs & Services"** → **"OAuth consent screen"**
4. Dans la section **"Publishing status"**, cliquez sur **"PUBLISH APP"**
5. Confirmez avec **"CONFIRM"** dans la boîte de dialogue
6. Le statut passe à ✅ **"In production"**

> 📝 **Note** : Google peut afficher un avertissement de vérification pour les scopes restreints. Pour un usage développeur interne (Chrome Web Store API), la vérification n'est pas nécessaire — la publication suffit.

### 2.2 Régénérer le refresh token après publication
Après la publication, **tout token existant généré en mode Testing doit être regénéré**. Suivez l'Étape 3 ci-dessous pour obtenir un nouveau refresh token valable jusqu'à 6 mois.

---

## Étape 3 : Méthode Google OAuth Playground (Recommandée)

### 3.1 Configuration initiale
1. Allez sur https://developers.google.com/oauthplayground/
2. Cliquez sur l'icône ⚙️ (Settings) en haut à droite
3. Cochez "Use your own OAuth credentials"
4. Renseignez :
   - **OAuth Client ID** : `[VOTRE_CLIENT_ID]`
   - **OAuth Client secret** : `[VOTRE_CLIENT_SECRET]`
5. Cliquez sur "Close"

### 3.2 Configuration du scope
1. Dans la section "Step 1 Select & authorize APIs"
2. Faites défiler vers le bas et trouvez le champ "Input your own scopes"
3. Saisissez exactement : `https://www.googleapis.com/auth/chromewebstore`
4. Cliquez sur "Authorize APIs"

### 3.3 Autorisation
1. Une nouvelle fenêtre s'ouvre pour l'autorisation Google
2. **Connectez-vous avec le compte Google associé à votre Chrome Web Store**
3. Autorisez l'accès en cliquant sur "Allow"
4. Vous serez redirigé vers OAuth Playground

### 3.4 Obtention du refresh token
1. Dans "Step 2 Exchange authorization code for tokens"
2. Cliquez sur "Exchange authorization code for tokens"
3. Le refresh token apparaît dans la réponse JSON
4. **Copiez la valeur du `refresh_token`** (commence généralement par `1//`)

## Étape 4 : Méthode alternative avec cURL/Postman

### 4.1 URL d'autorisation
Remplacez `VOTRE_CLIENT_ID` par votre vrai Client ID et visitez cette URL :

```
https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=VOTRE_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&access_type=offline&prompt=consent
```

### 4.2 Obtenir le code d'autorisation
1. Connectez-vous et autorisez l'application
2. Copiez le code d'autorisation affiché sur la page

### 4.3 Échanger le code contre un refresh token
Utilisez cURL ou Postman pour faire cette requête :

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=VOTRE_CLIENT_ID" \
  -d "client_secret=VOTRE_CLIENT_SECRET" \
  -d "code=CODE_AUTORISATION" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```

## Étape 5 : Configuration des GitHub Secrets

### 5.1 Obtenir l'Extension ID
1. Allez sur https://chrome.google.com/webstore/devconsole
2. Cliquez sur votre extension
3. L'Extension ID est affiché dans l'URL ou dans les détails de l'extension

### 5.2 Ajouter les secrets dans GitHub
1. Allez dans votre repository GitHub
2. Cliquez sur "Settings" > "Secrets and variables" > "Actions"
3. Cliquez sur "New repository secret" pour chaque secret :

**Secrets requis :**
- **CHROME_CLIENT_ID** : Votre Client ID OAuth
- **CHROME_CLIENT_SECRET** : Votre Client Secret OAuth
- **CHROME_REFRESH_TOKEN** : Le refresh token obtenu précédemment
- **CHROME_EXTENSION_ID** : L'ID de votre extension Chrome

## Étape 6 : Test de configuration

### 6.1 Vérifier le workflow
Votre workflow GitHub utilise déjà la bonne configuration :

```yaml
- name: Publish to Chrome Store
  uses: PlasmoHQ/bpp@v3
  with:
    keys: '{"chrome":{"clientId":"${{ secrets.CHROME_CLIENT_ID }}","clientSecret":"${{ secrets.CHROME_CLIENT_SECRET }}","refreshToken":"${{ secrets.CHROME_REFRESH_TOKEN }}","extId":"${{ secrets.CHROME_EXTENSION_ID }}"}}'
    chrome-file: release/chrome-${{ env.PACKAGE_VERSION }}.zip
```

### 6.2 Test manuel (optionnel)
Vous pouvez tester votre refresh token avec cette requête :

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=VOTRE_CLIENT_ID" \
  -d "client_secret=VOTRE_CLIENT_SECRET" \
  -d "refresh_token=VOTRE_REFRESH_TOKEN" \
  -d "grant_type=refresh_token"
```

## Dépannage

### Erreurs communes

**"Invalid scope"**
- Vérifiez que le scope est exactement `https://www.googleapis.com/auth/chromewebstore`

**"Invalid client"**
- Vérifiez que votre Client ID et Client Secret sont corrects
- Assurez-vous que l'API Chrome Web Store est activée

**"Invalid grant"**
- Le code d'autorisation a expiré (10 minutes max)
- Recommencez le processus d'autorisation

**"Unauthorized"**
- Vérifiez que vous utilisez le bon compte Google (celui du développeur)
- L'extension doit être publiée sur le Chrome Web Store

## Notes importantes

- ⚠️ **Le refresh token ne doit jamais être partagé publiquement**
- ⚠️ **Durée de validité du refresh token** : 
  - Pour les applications en mode "Testing" : **7 jours maximum**
  - Pour les applications publiées/vérifiées : **Jusqu'à 6 mois** (peut être révoqué avant)
  - Le refresh token peut expirer si non utilisé pendant une longue période
- 🔄 **En cas d'expiration**, vous devrez régénérer un nouveau refresh token
- 📝 **Gardez une copie sécurisée** de vos credentials pour référence future
- 🔔 **Surveillez vos workflows** - ils échoueront si le refresh token expire

### Différence entre Access Token et Refresh Token

**Access Token :**
- Durée de vie : **1 heure**
- Utilisé pour les appels API directs
- Se régénère automatiquement avec le refresh token

**Refresh Token :**
- Durée de vie : **Variable selon le statut de l'application**
- Utilisé pour obtenir de nouveaux access tokens
- Doit être régénéré manuellement quand il expire

### Stratégie de maintenance

1. **Monitoring** : Surveillez vos workflows GitHub Actions
2. **Rotation** : Planifiez la régénération tous les 3-6 mois
3. **Backup** : Gardez vos credentials OAuth en sécurité
4. **Documentation** : Notez la date de génération du refresh token

### Signes d'expiration du refresh token

- Workflows GitHub Actions qui échouent avec des erreurs d'authentification
- Messages d'erreur type "invalid_grant" ou "unauthorized"
- L'extension ne se met plus à jour automatiquement sur le Chrome Web Store

---

*Document créé le 23 août 2025 pour le projet Xtense Web Extension*
*Dernière mise à jour : Ajout de l'étape de validation OAuth (passage en Production)*
