# Guide: Mettre votre projet sur GitHub

Suivez ces étapes pour mettre **TradeSense AI** en ligne sur GitHub de manière professionnelle.

## 📋 Prérequis

- Un compte [GitHub](https://github.com/join).
- [Git](https://git-scm.com/downloads) installé sur votre machine.

---

## 🚀 Étapes à suivre

### 1. Initialiser Git localement

Ouvrez votre terminal (PowerShell ou CMD) à la racine du projet (`Projet_TradeSens`) et exécutez :

```bash
git init
```

### 2. Ajouter les fichiers au repo

Ajoutez tous vos fichiers (le fichier `.gitignore` que j'ai créé s'occupera d'exclure les dossiers lourds comme `node_modules`) :

```bash
git add .
```

### 3. Faire votre premier Commit

```bash
git commit -m "Initial commit: TradeSense AI Platform complete"
```

### 4. Créer le dépôt sur GitHub

1. Allez sur [github.com/new](https://github.com/new).
2. Nommez votre dépôt (ex: `TradeSense-AI`).
3. **Important**: Ne cochez PAS "Initialize this repository with a README" (nous l'avons déjà).
4. Cliquez sur **Create repository**.

### 5. Lier votre projet local à GitHub

Copiez l'URL de votre dépôt GitHub (ex: `https://github.com/votre-nom/TradeSense-AI.git`) et exécutez :

```bash
git remote add origin https://github.com/votre-nom/TradeSense-AI.git
git branch -M main
```

### 6. Envoyer le code (Push)

```bash
git push -u origin main
```

---

## 🛡️ Note sur la Sécurité

J'ai déjà configuré un fichier `.gitignore` pour vous assurer que :

- Vos clés API (.env) ne sont **JAMAIS** envoyées sur GitHub.
- Les dossiers `node_modules`, `venv` et `.next` sont exclus (trop lourds).
- Votre base de données SQLite locale reste privée.

**Félicitations ! Votre projet est maintenant sécurisé et partagé sur GitHub.**
