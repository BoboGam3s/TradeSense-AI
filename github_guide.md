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

Copiez l'URL de votre dépôt GitHub (ex: `https://github.com/BoboGam3s/TradeSense-AI.git`) et exécutez :

```bash
git remote add origin https://github.com/BoboGam3s/TradeSense-AI.git
git branch -M main
```

### 6. Envoyer le code (Push)

```bash
git push -u origin main
```

---

## �️ Résolution des Erreurs (Fix)

### Si vous avez l'erreur "HTTP 408" (Timeout)

Cette erreur arrive car le projet contient des vidéos (`.mp4`) qui sont lourdes, et la connexion avec GitHub expire.

1. **Augmenter la taille du tampon Git (Buffer) :**
   Exécutez cette commande pour permettre des envois plus gros :

```bash
git config --global http.postBuffer 524288000
```

2.  **Réessayer le Push :**

```bash
git push -u origin main
```

3.  **Si ça bloque toujours :**

    ### Si vous avez l'erreur "File is too large" (> 100 Mo)

    GitHub limite les fichiers individuels à 100 Mo. Pour vos vidéos, nous utilisons **Git LFS (Large File Storage)**.

    1.  **Initialiser Git LFS :**

    ```bash
    git lfs install
    ```

    2.  **Suivre les fichiers lourds :**

    ```bash
    git lfs track "frontend/public/videos/*.mp4"
    ```

    3.  **Ajouter les fichiers et pousser :**

    ```bash
    git add .gitattributes
    git add frontend/public/videos/*.mp4
    git commit -m "Add large video files using Git LFS"
    git push
    ```

---

## 🛡️ Note sur la Sécurité

J'ai déjà configuré un fichier `.gitignore` pour vous assurer que :

- Vos clés API (.env) ne sont **JAMAIS** envoyées sur GitHub.
- Les dossiers `node_modules`, `venv` et `.next` sont exclus (trop lourds).
- Votre base de données SQLite locale reste privée.

**Félicitations ! Votre projet est maintenant sécurisé et partagé sur GitHub.**
