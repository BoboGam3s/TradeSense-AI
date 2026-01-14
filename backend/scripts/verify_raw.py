import sqlite3
import os
from werkzeug.security import check_password_hash

db_path = os.path.join("instance", "tradesense.db")
abs_db_path = os.path.abspath(db_path)

def verify_raw():
    print(f"Checking DB: {abs_db_path}")
    conn = sqlite3.connect(abs_db_path)
    cursor = conn.cursor()
    
    # Test 1: Known user from UI
    email1 = 'user1@test.com'
    cursor.execute("SELECT password_hash FROM users WHERE email=?;", (email1,))
    row1 = cursor.fetchone()
    if row1:
        is_valid = check_password_hash(row1[0], "password123")
        print(f"Password 'password123' for {email1}: {'VALID' if is_valid else 'INVALID'}")
    
    # Test 2: My test user
    email2 = 'starter@tradesense.ai'
    cursor.execute("SELECT password_hash FROM users WHERE email=?;", (email2,))
    row2 = cursor.fetchone()
    if row2:
        is_valid = check_password_hash(row2[0], "TradeSense2025!")
        print(f"Password 'TradeSense2025!' for {email2}: {'VALID' if is_valid else 'INVALID'}")
    else:
        print(f"User {email2} NOT FOUND")
    
    conn.close()

if __name__ == "__main__":
    verify_raw()
