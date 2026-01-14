import sqlite3
import os
import sys
from werkzeug.security import generate_password_hash

# Resolve paths
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(base_dir, "instance", "tradesense.db")

def setup_users():
    print(f"Targeting Database: {db_path}")
    if not os.path.exists(db_path):
        print("ERROR: Database file not found!")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    plans = [
        {'email': 'admin@tradesense.ai', 'full_name': 'Admin TradeSense', 'plan': 'pro', 'balance': 50000, 'target': 10, 'role': 'admin'},
        {'email': 'free@tradesense.ai', 'full_name': 'Test Free Plan', 'plan': 'free', 'balance': 500, 'target': 5, 'role': 'user'},
        {'email': 'starter@tradesense.ai', 'full_name': 'Test Starter Plan', 'plan': 'starter', 'balance': 5000, 'target': 10, 'role': 'user'},
        {'email': 'pro@tradesense.ai', 'full_name': 'Test Pro Plan', 'plan': 'pro', 'balance': 50000, 'target': 10, 'role': 'user'},
        {'email': 'elite@tradesense.ai', 'full_name': 'Test Elite Plan', 'plan': 'elite', 'balance': 200000, 'target': 10, 'role': 'user'},
    ]
    
    password = "TradeSense2025!"
    pwd_hash = generate_password_hash(password)
    
    for p in plans:
        # 1. UPSERT User
        cursor.execute("SELECT id FROM users WHERE email=?;", (p['email'],))
        user_row = cursor.fetchone()
        
        if user_row:
            print(f"Updating existing user: {p['email']}")
            cursor.execute("""
                UPDATE users 
                SET full_name=?, plan_type=?, password_hash=?, role=?, created_at=COALESCE(created_at, CURRENT_TIMESTAMP)
                WHERE email=?;
            """, (p['full_name'], p['plan'], pwd_hash, p['role'], p['email']))
            user_id = user_row[0]
        else:
            print(f"Creating new user: {p['email']}")
            cursor.execute("""
                INSERT INTO users (email, full_name, plan_type, password_hash, language, role, created_at)
                VALUES (?, ?, ?, ?, 'fr', ?, CURRENT_TIMESTAMP);
            """, (p['email'], p['full_name'], p['plan'], pwd_hash, p['role']))
            user_id = cursor.lastrowid
            
        # 2. Sync active challenge
        cursor.execute("SELECT id FROM challenges WHERE user_id=? AND status='active';", (user_id,))
        challenge_row = cursor.fetchone()
        
        if challenge_row:
            print(f"Updating active challenge for {p['email']}")
            cursor.execute("""
                UPDATE challenges
                SET initial_balance=?, current_equity=?, plan_type=?, profit_target_percent=?
                WHERE id=?;
            """, (p['balance'], p['balance'], p['plan'], p['target'], challenge_row[0]))
        else:
            print(f"Creating new active challenge for {p['email']}")
            cursor.execute("""
                INSERT INTO challenges (user_id, plan_type, initial_balance, current_equity, profit_target_percent, 
                                      max_daily_loss_percent, max_total_loss_percent, status)
                VALUES (?, ?, ?, ?, ?, 5, 10, 'active');
            """, (user_id, p['plan'], p['balance'], p['balance'], p['target']))

    conn.commit()
    print("SUCCESS: All users and challenges synced via direct SQLite.")
    conn.close()

if __name__ == "__main__":
    setup_users()
