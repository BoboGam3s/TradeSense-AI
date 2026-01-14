import sqlite3
import os

db_path = os.path.join("instance", "tradesense.db")

def check_schema():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(users);")
    columns = cursor.fetchall()
    print("Columns in 'users' table:")
    for col in columns:
        print(f"- {col[1]} ({col[2]})")
    conn.close()

if __name__ == "__main__":
    check_schema()
