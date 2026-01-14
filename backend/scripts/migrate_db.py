import sqlite3
import os

db_path = os.path.join("instance", "tradesense.db")

def migrate():
    print(f"Migrating {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check users table
    cursor.execute("PRAGMA table_info(users);")
    user_cols = [col[1] for col in cursor.fetchall()]
    
    missing_user_cols = {
        'role': "VARCHAR(20) DEFAULT 'user'",
        'plan_type': "VARCHAR(20) DEFAULT 'free'",
        'language': "VARCHAR(5) DEFAULT 'fr'",
        'academy_progress': "JSON",
        'created_at': "DATETIME DEFAULT CURRENT_TIMESTAMP"
    }
    
    for col, definition in missing_user_cols.items():
        if col not in user_cols:
            print(f"Adding column '{col}' to 'users' table...")
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {definition};")
            except Exception as e:
                print(f"Error adding {col}: {e}")

    # Check challenges table
    cursor.execute("PRAGMA table_info(challenges);")
    challenge_cols = [col[1] for col in cursor.fetchall()]
    
    # Ensure current_equity exists (it should, but just in case)
    if 'current_equity' not in challenge_cols:
        print("Adding 'current_equity' to 'challenges' table...")
        cursor.execute("ALTER TABLE challenges ADD COLUMN current_equity FLOAT DEFAULT 0.0;")

    conn.commit()
    print("Migration finished.")
    
    # Final check
    cursor.execute("PRAGMA table_info(users);")
    final_cols = [col[1] for col in cursor.fetchall()]
    print(f"Final columns in 'users': {final_cols}")
    
    conn.close()

if __name__ == "__main__":
    migrate()
