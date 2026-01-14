# TradeSense AI - Prop Trading Platform

<div align="center">

![TradeSense AI](https://img.shields.io/badge/TradeSense-AI-00ff88?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-lightgrey?style=for-the-badge&logo=flask)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Google Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?style=for-the-badge&logo=google)

**La Première Prop Firm Assistée par IA pour l'Afrique**

[Demo](#demo) • [Installation](#installation) • [Features](#features) • [API](#api-documentation)

</div>

---

## 📖 Table des Matières

- [À Propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)

---

## 🚀 À Propos

**TradeSense AI** est une plateforme complète de proprietary trading qui permet aux traders de passer des challenges pour obtenir un financement. La plateforme utilise l'intelligence artificielle (Google Gemini) pour fournir des signaux de trading en temps réel, des analyses de marché et du coaching personnalisé.

### Objectifs du Challenge

- 💰 **Capital Initial**: 5 000 $
- 📈 **Objectif de Profit**: +10%
- 🔻 **Perte Max Journalière**: -5%
- 🔻 **Perte Max Totale**: -10%

---

## ✨ Fonctionnalités

### 🎯 Trading

- ✅ Données en temps réel (US stocks, Crypto, Morocco BVC)
- ✅ Exécution de trades (Buy/Sell)
- ✅ Portfolio tracking avec P&L
- ✅ TradingView Lightweight Charts (à implémenter)

### 🤖 Intelligence Artificielle

- ✅ Signaux de trading (Google Gemini)
- ✅ Analyse de performance
- ✅ Résumés de marché quotidiens
- ✅ Coaching personnalisé

### 🏆 Gamification

- ✅ Leaderboard des meilleurs traders
- ✅ Système de challenges avec règles automatisées
- ✅ Badges par plan (Starter, Pro, Elite)

### 💳 Paiement

- ✅ Mock Payment (simulation)
- ⏳ Intégration PayPal (structure prête)

### 🌐 Multi-langue

- ✅ Français
- ✅ English
- ✅ العربية (Arabic)

### 🛡️ Admin Panel

- ✅ Gestion des utilisateurs
- ✅ Contrôle des challenges
- ✅ Configuration PayPal
- ✅ Statistiques de la plateforme

---

## 🛠️ Stack Technique

### Backend

- **Framework**: Flask 3.0
- **Database**: SQLite (dev) / PostgreSQL (production ready)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (Flask-JWT-Extended)
- **AI**: Google Generative AI (Gemini)
- **Market Data**:
  - yfinance (US Stocks & Crypto)
  - BeautifulSoup (Morocco BVC scraper)
- **Background Tasks**: APScheduler

### Frontend

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Charts**: Lightweight Charts (TradingView)
- **HTTP Client**: Axios
- **Internationalization**: Custom i18n system
- **Animations**: Framer Motion

---

## 📦 Installation

### Prérequis

- Python 3.9+
- Node.js 18+
- npm ou yarn
- Google Gemini API Key

### 1. Cloner le projet

```bash
git clone <repository-url>
cd Exam_80%
```

### 2. Backend Setup

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier d'environnement
copy .env.example .env

# Éditer .env et ajouter votre GOOGLE_API_KEY
```

### 3. Frontend Setup

```bash
cd ../frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
copy .env.example .env.local
```

---

## ⚙️ Configuration

### Backend (.env)

```env
# Flask
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Database
DATABASE_URL=sqlite:///tradesense.db

# Google Gemini AI (REQUIRED)
GOOGLE_API_KEY=your-google-api-key-here

# Challenge Settings
INITIAL_CHALLENGE_BALANCE=5000
MAX_DAILY_LOSS_PERCENT=5
MAX_TOTAL_LOSS_PERCENT=10
PROFIT_TARGET_PERCENT=10
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Obtenir une clé API Google Gemini

1. Visitez [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez un nouveau projet
3. Générez une clé API
4. Ajoutez-la dans `backend/.env`:
   ```
   GOOGLE_API_KEY=votre-cle-ici
   ```

---

## 🚀 Utilisation

### 1. Initialiser la base de données

```bash
cd backend
python seed.py
```

Cela créera:

- 1 compte admin
- 10 comptes utilisateurs de test
- Plusieurs challenges avec des statuts variés
- Données de trades simulées

### 2. Démarrer le Backend

```bash
cd backend
python run.py
```

Le serveur démarre sur `http://localhost:5000`

### 3. Démarrer le Frontend

```bash
cd frontend
npm run dev
```

L'application démarre sur `http://localhost:3000`

### 4. Accès aux comptes de test

**Admin**:

- Email: `admin@tradesense.ai`
- Password: `admin123`

**Utilisateur**:

- Email: `user1@test.com`
- Password: `password123`

---

## 📁 Architecture

```
Exam_80%/
├── backend/
│   ├── app/
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── config.py              # Configuration
│   │   ├── routes/                # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── trading.py
│   │   │   ├── market.py
│   │   │   ├── challenge.py
│   │   │   ├── payment.py
│   │   │   └── admin.py
│   │   ├── services/              # Business logic
│   │   │   ├── market_data.py     # yfinance + scraper
│   │   │   ├── ai_service.py      # Google Gemini
│   │   │   └── challenge_engine.py # Rules verification
│   │   └── utils/
│   ├── run.py                     # Entry point
│   ├── seed.py                    # Database seeding
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.js            # Landing page
    │   │   ├── login/
    │   │   ├── register/
    │   │   ├── pricing/
    │   │   ├── dashboard/         # Main trading UI
    │   │   └── leaderboard/
    │   ├── lib/
    │   │   ├── api.js             # Axios client
    │   │   ├── auth.js            # Auth utilities
    │   │   └── i18n.js            # Translations
    │   └── styles/
    │       └── globals.css        # Tailwind + custom styles
    └── package.json
```

---

## 📡 API Documentation

### Authentication

#### POST `/api/auth/register`

Inscription d'un nouvel utilisateur.

**Body**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "language": "fr"
}
```

#### POST `/api/auth/login`

Connexion utilisateur.

**Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Market Data

#### GET `/api/market/price/{symbol}`

Obtenir le prix en temps réel d'un symbole.

**Response**:

```json
{
  "symbol": "AAPL",
  "price": 180.5,
  "change_percent": 1.25,
  "timestamp": "2024-01-01T12:00:00"
}
```

#### GET `/api/market/ai-signal/{symbol}`

Obtenir un signal de trading IA.

**Response**:

```json
{
  "symbol": "AAPL",
  "signal": "BUY",
  "confidence": 75,
  "reasoning": "Strong upward momentum...",
  "key_factors": ["Technical analysis", "Market sentiment"]
}
```

### Trading

#### POST `/api/trading/execute`

Exécuter un trade.

**Body**:

```json
{
  "symbol": "AAPL",
  "action": "buy",
  "quantity": 10
}
```

#### GET `/api/trading/portfolio`

Obtenir le portfolio et challenge actif.

### Challenge

#### GET `/api/challenge/leaderboard`

Obtenir le classement des traders.

#### GET `/api/challenge/current`

Obtenir le challenge actif de l'utilisateur.

### Payment

#### POST `/api/payment/mock-payment`

Simuler un paiement et créer un challenge.

**Body**:

```json
{
  "plan_type": "starter"
}
```

---

## 🎨 Design

Le design utilise un thème **cyber-finance dark mode** avec:

- Couleurs néon (vert pour profit, rouge pour perte)
- Effet glassmorphism
- Animations fluides
- Responsive design (mobile & desktop)

---

## 🔐 Sécurité

- ✅ Mots de passe hashés (Werkzeug)
- ✅ JWT pour l'authentification
- ✅ Protection des routes admin
- ✅ Validation des données côté serveur
- ✅ CORS configuré

---

## 📈 Roadmap

- [ ] TradingView Charts complets
- [ ] WebSocket pour les prix en temps réel
- [ ] Intégration PayPal complète
- [ ] Notifications push
- [ ] Application mobile (React Native)
- [ ] Mode démo sans inscription

---

## 📝 Licence

Ce projet est développé à des fins éducatives.

---

## 👥 Support

Pour toute question ou problème:

- 📧 Email: support@tradesense.ai
- 💬 Support: Via le dashboard

---

<div align="center">

**Fait avec ❤️ par AKKAD Abdelmoughit**

⭐ Si vous aimez ce projet, donnez-lui une étoile!

</div>
