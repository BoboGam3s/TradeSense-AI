from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3

db_path = 'instance/tradesense.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT password_hash FROM users WHERE email='admin@tradesense.ai'")
row = cursor.fetchone()
conn.close()

if row:
    stored_hash = row[0]
    print(f"Stored Hash: {stored_hash}")
    test_pass = "admin123"
    is_valid = check_password_hash(stored_hash, test_pass)
    print(f"Password 'admin123' valid? {is_valid}")
    
    if not is_valid:
        print("Regenerating hash in current environment...")
        new_hash = generate_password_hash(test_pass)
        print(f"New Hash: {new_hash}")
        # Note: We won't update here, just compare
else:
    print("Admin user not found in DB")
