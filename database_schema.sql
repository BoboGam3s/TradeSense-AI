-- TradeSense AI - Database Schema Structure
-- This file provides a clear SQL structure of the database.

-- 1. Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    avatar_url VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    plan_type VARCHAR(20),
    language VARCHAR(5) DEFAULT 'fr',
    academy_progress JSON,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    verification_token_expires DATETIME,
    reset_token VARCHAR(100),
    reset_token_expires DATETIME,
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Challenges Table
CREATE TABLE challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_type VARCHAR(20) NOT NULL, -- 'starter', 'pro', 'elite'
    initial_balance FLOAT DEFAULT 5000.0,
    current_equity FLOAT DEFAULT 5000.0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'passed', 'failed'
    max_daily_loss_percent FLOAT DEFAULT 5.0,
    max_total_loss_percent FLOAT DEFAULT 10.0,
    profit_target_percent FLOAT DEFAULT 10.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 3. Trades Table
CREATE TABLE trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    action VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
    quantity FLOAT NOT NULL,
    price FLOAT NOT NULL,
    profit_loss FLOAT DEFAULT 0.0,
    is_open BOOLEAN DEFAULT TRUE,
    close_price FLOAT,
    notes TEXT,
    tags VARCHAR(255),
    screenshot_url VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges (id) ON DELETE CASCADE
);

-- 4. Payment Configuration Table
CREATE TABLE payment_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paypal_client_id VARCHAR(255),
    paypal_secret VARCHAR(255),
    is_live BOOLEAN DEFAULT FALSE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Price Alerts Table
CREATE TABLE price_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    target_price FLOAT NOT NULL,
    condition VARCHAR(10) NOT NULL, -- 'ABOVE' or 'BELOW'
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 6. Indexes
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_trades_timestamp ON trades (timestamp);

CREATE INDEX idx_trades_challenge_id ON trades (challenge_id);

CREATE INDEX idx_challenges_user_id ON challenges (user_id);

CREATE INDEX idx_price_alerts_user_id ON price_alerts (user_id);