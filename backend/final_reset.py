from werkzeug.security import generate_password_hash
import sqlite3
import os

db_path = 'instance/tradesense.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

new_hash = generate_password_hash("admin123")
email = "admin@tradesense.ai"

cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (new_hash, email))
conn.commit()
print(f"Update successful for {email} with new hash.")
conn.close()
