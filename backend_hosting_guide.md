# Guide : Héberger votre Backend sur Render (Gratuit)

Pour que votre site sur Vercel fonctionne, vous devez maintenant mettre en ligne le "moteur" (le Backend) sur **Render**.

---

## 🚀 Étapes pour le Déploiement Backend

### 1. Créer un compte Render

1. Allez sur [render.com](https://render.com) et connectez-vous avec votre compte **GitHub**.

### 2. Créer un nouveau "Web Service"

1. Cliquez sur **"New +"** puis **"Web Service"**.
2. Sélectionnez votre dépôt `TradeSense-AI`.

### 3. Configurer le service

Remplissez les informations suivantes :

- **Name** : `tradesense-backend`
- **Root Directory** : `backend` <-- **TRÈS IMPORTANT**
- **Language** : `Python`
- **Build Command** : `pip install -r requirements.txt`
- **Start Command** : `gunicorn --workers=1 --timeout 120 --log-level debug -b 0.0.0.0:$PORT run:app`

### 4. Ajouter les Variables d'Environnement

Cliquez sur le bouton **"Advanced"** ou allez dans l'onglet **"Environment"** et ajoutez les clés de votre fichier `.env` actuel :

- `SECRET_KEY` : (choisissez un mot de passe complexe)
- `JWT_SECRET_KEY` : (choisissez un autre mot de passe complexe)
- `DATABASE_URL` : `sqlite:////tmp/tradesense.db` (IMPÉRATIF : Utilisez /tmp pour éviter les erreurs de permission et "database is locked")
- `GOOGLE_API_KEY` : (votre clé Gemini)
- `PYTHON_VERSION` : `3.10.12` (Render gère mieux 3.10 que 3.13 pour l'instant)

### 5. Lancer le déploiement

Cliquez sur **"Create Web Service"**. Render va installer les dépendances et démarrer le serveur. Une fois terminé, vous aurez une URL (ex: `https://tradesense-backend.onrender.com`).

---

## 🔗 ÉTAPE FINALE : Relier Vercel et Render

Maintenant que vous avez l'URL de votre backend Render :

1. Retournez sur votre dashboard **Vercel**.
2. Allez dans **Settings** > **Environment Variables**.
3. Modifiez la variable `NEXT_PUBLIC_API_URL`.
4. Mettez la valeur : `https://votre-backend.onrender.com/api` (**ajoutez `/api` à la fin**).
5. Sauvegardez et redéployez sur Vercel.

---

**C'est terminé ! Votre site est maintenant en ligne et communique avec votre backend.**
