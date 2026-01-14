import sqlite3
import os

db_path = 'instance/tradesense.db'
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Set password to 'admin123' hash
# Generated hash: pbkdf2:sha256:600000$8b55f15deb108439c02
new_hash = "pbkdf2:sha256:600000$8b55f15deb108439c02"
email = "admin@tradesense.ai"

cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (new_hash, email))
conn.commit()
print(f"Update successful for {email}. {cursor.rowcount} rows affected.")
conn.close()
