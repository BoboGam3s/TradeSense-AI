import sqlite3
import os

db_path = os.path.join("instance", "tradesense.db")
abs_path = os.path.abspath(db_path)

def dump_all_users():
    print(f"Dumping from: {abs_path}")
    conn = sqlite3.connect(abs_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT email, plan_type FROM users;")
        users = cursor.fetchall()
        print(f"TOTAL USERS IN DISK DB: {len(users)}")
        for u in users:
            print(f"USER: {u[0]} | PLAN: {u[1]}")
    except Exception as e:
        print(f"ERROR: {e}")
        
    conn.close()

if __name__ == "__main__":
    dump_all_users()
