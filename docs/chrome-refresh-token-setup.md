# Guide : Obtenir le Refresh Token Chrome Web Store

> 📌 **Méthode officielle via GitHub Actions** — mise à jour avril 2026

## Prérequis

- Un compte développeur Chrome Web Store
- Une extension publiée sur le Chrome Web Store

---

## Étape 1 : Créer le projet Google Cloud et activer l'API

1. Allez sur https://console.developers.google.com/apis/credentials
2. Créez un nouveau projet (ex: `chrome-webstore-upload`)
3. Allez sur https://console.developers.google.com/apis/library/chromewebstore.googleapis.com
4. Cliquez sur **"Enable"**

---

## Étape 2 : Configurer l'écran de consentement OAuth

1. Allez sur https://console.cloud.google.com/apis/credentials/consent
2. Sélectionnez **"External"** → **"Create"**
3. Renseignez uniquement :
   - **Application name** : `chrome-webstore-upload`
   - Les champs email obligatoires
4. Cliquez **"Save"** et terminez la configuration

---

## Étape 3 : Publier l'application OAuth (→ Production)

> ⚠️ **Obligatoire avant de générer le token** : En mode "Testing", les tokens expirent après **7 jours**.

1. Sur https://console.cloud.google.com/apis/credentials/consent
2. Dans **"Publishing status"** → cliquez **"PUBLISH APP"** → confirmez
3. Le statut passe à ✅ **"In production"** — les tokens durent jusqu'à **6 mois**

---

## Étape 4 : Créer les credentials OAuth

> ⚠️ **Depuis 2025, Google ne permet plus de télécharger le secret d'un client OAuth existant.**
> Si vous avez perdu vos credentials, vous devez créer un nouveau client OAuth.

### Option A : Créer un nouveau client OAuth (recommandé)

1. Allez sur https://console.developers.google.com/apis/credentials
2. **"Create credentials"** → **"OAuth client ID"**
3. Type : **"Desktop app"** → nom : `Chrome Webstore Upload` → **"Create"**
4. Notez le **Client ID** et le **Client Secret** affichés (ou téléchargez le JSON)
5. *(Optionnel)* Supprimez l'ancien client OAuth devenu inutile

### Option B : Ajouter un nouveau secret à un client existant

1. Allez sur https://console.developers.google.com/apis/credentials
2. Cliquez sur votre client OAuth existant
3. Section **"Client secrets"** → **"ADD SECRET"**
4. Notez le nouveau secret affiché **immédiatement** (il ne sera plus visible après)

---

## Étape 5 : Générer le refresh token via le workflow GitHub

> Prérequis : créer un **GitHub PAT** avec le scope `repo` et l'ajouter comme secret **`GH_PAT_SECRETS`** dans le repo.

1. Construisez l'URL d'autorisation en remplaçant `CLIENT_ID` par votre `CHROME_CLIENT_ID` :
   ```
   https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&access_type=offline&prompt=consent
   ```
2. Ouvrez l'URL → connectez-vous avec le compte Google du Chrome Web Store developer → autorisez → **copiez le code** affiché
3. Allez sur GitHub → **Actions** → **"Renew Chrome OAuth Token"** → **"Run workflow"**
4. Collez le code dans le champ `auth_code` → **"Run workflow"**
5. ✅ Le secret `CHROME_REFRESH_TOKEN` est mis à jour automatiquement

---

## Étape 6 : Configuration des GitHub Secrets

→ **Settings** > **Secrets and variables** > **Actions**

| Secret | Valeur |
|---|---|
| `CHROME_CLIENT_ID` | Client ID OAuth |
| `CHROME_CLIENT_SECRET` | Client Secret OAuth |
| `CHROME_REFRESH_TOKEN` | Mis à jour automatiquement par le workflow |
| `CHROME_EXTENSION_ID` | ID de l'extension (depuis https://chrome.google.com/webstore/devconsole) |
| `GH_PAT_SECRETS` | GitHub PAT avec scope `repo` |

---

## Étape 7 : Vérifier le workflow de publication

Le workflow `publish-release.yml` assemble les credentials à la volée :

```yaml
- name: Publish Extensions
  uses: PlasmoHQ/bpp@v3
  with:
    keys: >-
      {
        "chrome": {
          "clientId": "${{ secrets.CHROME_CLIENT_ID }}",
          "clientSecret": "${{ secrets.CHROME_CLIENT_SECRET }}",
          "refreshToken": "${{ secrets.CHROME_REFRESH_TOKEN }}",
          "extId": "${{ secrets.CHROME_EXTENSION_ID }}"
        }
      }
```

### Test manuel du refresh token
```bash
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=VOTRE_CLIENT_ID" \
  -d "client_secret=VOTRE_CLIENT_SECRET" \
  -d "refresh_token=VOTRE_REFRESH_TOKEN" \
  -d "grant_type=refresh_token"
```

---

## Dépannage

| Erreur | Cause | Solution |
|---|---|---|
| `401 Unauthorized` | Refresh token expiré ou invalide | Relancer le workflow **"Renew Chrome OAuth Token"** |
| `400 Bad Request` | Token généré en mode Testing | Vérifier que l'app est bien **"In production"** (Étape 3) |
| `Invalid scope` | Mauvais scope OAuth | Vérifier que l'API Chrome Web Store est activée (Étape 1) |
| `Invalid client` | Client ID/Secret incorrects | Recréer un client OAuth (Étape 4) |

---

## Notes importantes

- ⚠️ **Durée de validité du refresh token** :
  - Mode **"Testing"** : 7 jours maximum
  - Mode **"In production"** : jusqu'à 6 mois
- 🔄 En cas d'expiration : relancer le workflow **"Renew Chrome OAuth Token"**
- 📅 Token généré le : **17 avril 2026** — prochaine rotation recommandée : **octobre 2026**

---

*Document créé le 23 août 2025 pour le projet Xtense Web Extension*
*Dernière mise à jour : Avril 2026 — Publication via GitHub Actions uniquement*
