import sqlite3
import os

db_path = os.path.join("instance", "tradesense.db")

def check_db():
    abs_db_path = os.path.abspath(db_path)
    print(f"Checking database at: {abs_db_path}")
    
    if not os.path.exists(abs_db_path):
        print(f"Database file NOT FOUND at: {abs_db_path}")
        return

    try:
        conn = sqlite3.connect(abs_db_path)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"Tables: {tables}")
        
        if 'users' in tables:
            cursor.execute("SELECT email, plan_type FROM users;")
            users = cursor.fetchall()
            print(f"Total users in DB: {len(users)}")
            for u in users:
                print(f"- {u[0]} | Plan: {u[1]}")
        else:
            print("Table 'users' NOT FOUND!")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
