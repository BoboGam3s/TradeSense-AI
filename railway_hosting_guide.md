# Guide : Héberger votre Backend sur Railway 🚂

Railway est une excellente alternative à Render, souvent plus simple et mieux intégrée pour les projets Python.

---

## 🚀 Étapes pour le Déploiement Backend sur Railway

### 1. Créer un compte

1. Allez sur [railway.app](https://railway.app/).
2. Connectez-vous avec **GitHub**.

### 2. Créer un nouveau projet
    
1. Cliquez sur le bouton violet **"New Project"** (ou **"Start a New Project"**).
2. Choisissez **"Deploy from GitHub repo"**.
3. Sélectionnez votre dépôt : `TradeSense-AI`.

### 3. Configurer le Service

1. Une fois le projet importé, Railway va essayer de détecter la configuration.
2. Cliquez sur la "carte" de votre projet (le cadre rectangulaire).
3. Allez dans l'onglet **"Settings"**.
4. Dans la section **Build**, repérez "Root Directory" (ou "App Root").
5. **Changez-le pour :** `/backend` (ou `backend` tout court).

> **Important** : Si vous ne spécifiez pas le dossier `backend`, Railway ne trouvera pas les fichiers nécessaires.

### 4. Variables d'Environnement

Allez dans l'onglet **"Variables"** et ajoutez les clés suivantes (exactement comme sur Render) :

| Variable Name    | Value                                                                       |
| :--------------- | :-------------------------------------------------------------------------- |
| `GOOGLE_API_KEY` | `(Votre clé)`                                                               |
| `SECRET_KEY`     | `UneCleSecrete`                                                             |
| `JWT_SECRET_KEY` | `UneAutreCleSecrete`                                                        |
| `DATABASE_URL`   | `sqlite:///instance/tradesense.db`                                          |
| `PORT`           | `8000` (Optionnel, Railway le fait souvent seul, mais mieux vaut le mettre) |

### 5. Configurer le démarrage (Start Command)

Toujours dans **"Settings"**, cherchez la section **"Deploy"** > **"Start Command"**.
Mettez cette commande :

```bash
gunicorn run:app
```

(Pas besoin de préciser le port ici si Railway gère le `$PORT` automatiquement, mais dans le doute, `gunicorn -b 0.0.0.0:$PORT run:app` est le plus sûr).

Le plus simple est d'utiliser le fichier `Procfile` que j'ai ajouté à votre projet pour que Railway le lise automatiquement.

---

## 🔗 Relier à Vercel

1. Une fois le déploiement Railway terminé (tout vert), vous verrez une URL publique (domaine `up.railway.app` ou similar).
   - Si vous n'en avez pas, allez dans l'onglet **"Settings"** > **"Networking"** et cliquez sur **"Generate Domain"**.
2. Copiez cette URL (ex: `https://tradesense-production.up.railway.app`).
3. Allez sur **Vercel** > Settings > Environment Variables.
4. Mettez à jour `NEXT_PUBLIC_API_URL` avec `https://votre-url-railway.app/api`.
5. Redéployez Vercel.

---

**Note sur SQLite** :
Sur Railway (en version gratuite/build basique), le système de fichiers est "éphemère". Cela veut dire que si vous redéployez, **la base de données SQLite se remet à zéro**.
Pour un test/démo, ce n'est pas grave. Pour une vraie prod, Railway propose un plugin **PostgreSQL** en 1 clic (très facile à ajouter et à relier).
