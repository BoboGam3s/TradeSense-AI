# Guide : Héberger votre projet sur Vercel

Ce guide vous explique comment déployer la partie **Frontend (Next.js)** de TradeSense AI sur Vercel.

> [!IMPORTANT]
> Vercel est optimisé pour le Frontend (Next.js). Pour le **Backend (Python Flask)**, vous devrez utiliser un autre service comme **Render**, **Railway** ou **Heroku**.

---

## 🚀 Étapes pour le Déploiement Frontend

### 1. Préparer votre compte Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous avec votre compte **GitHub**.
2. Cliquez sur **"Add New"** puis **"Project"**.

### 2. Importer le dépôt GitHub

1. Vous verrez une liste de vos dépôts GitHub.
2. Recherchez `TradeSense-AI` et cliquez sur **"Import"**.

### 3. Configurer le projet (Très Important)

Comme votre projet est un "monorepo" (Frontend et Backend dans le même dossier), vous devez configurer ces paramètres :

- **Root Directory** : Cliquez sur "Edit" et sélectionnez le dossier `frontend`.
- **Framework Preset** : Sélectionnez `Next.js`.
- **Build Command** : Laissez par défaut (`npm run build`).

### 4. Ajouter les Variables d'Environnement

Déroulez la section **"Environment Variables"** et ajoutez :

| Key                   | Value                                                                                |
| :-------------------- | :----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | L'URL de votre backend une fois hébergé (ex: `https://votre-backend.render.com/api`) |

> [!TIP]
> Pour tester le front avant d'avoir le backend en ligne, vous pouvez mettre `http://localhost:5000/api` temporairement, mais les données ne s'afficheront pas en production.

### 5. Déployer

Cliquez sur **"Deploy"**. Vercel va construire votre site et vous donner une URL (ex: `tradesense-ai.vercel.app`).

---

## 🔧 Prochaines Étapes : Le Backend

Une fois le Frontend en ligne, voici ce qu'il faudra faire pour le Backend :

1.  **Héberger le Backend** sur Render ou Railway.
2.  **Mettre à jour l'URL** dans les variables d'environnement de Vercel.
3.  **CORS** : Assurez-vous que votre backend autorise l'URL Vercel dans `backend/app/__init__.py`.

---

**Félicitations ! Votre interface est maintenant accessible partout dans le monde.**
