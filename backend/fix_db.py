import sqlite3
import os

def fix_database():
    db_path = 'instance/tradesense.db'
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check challenges table
        cursor.execute("PRAGMA table_info(challenges)")
        columns_challenges = [info[1] for info in cursor.fetchall()]
        
        if 'profit_target_percent' not in columns_challenges:
            print("Adding profit_target_percent column to challenges table...")
            cursor.execute("ALTER TABLE challenges ADD COLUMN profit_target_percent FLOAT DEFAULT 10.0")
        
        if 'max_daily_loss_percent' not in columns_challenges:
             print("Adding max_daily_loss_percent column...")
             cursor.execute("ALTER TABLE challenges ADD COLUMN max_daily_loss_percent FLOAT DEFAULT 5.0")
             
        if 'max_total_loss_percent' not in columns_challenges:
             print("Adding max_total_loss_percent column...")
             cursor.execute("ALTER TABLE challenges ADD COLUMN max_total_loss_percent FLOAT DEFAULT 10.0")

        # Check users table
        print("Checking users table...")
        cursor.execute("PRAGMA table_info(users)")
        columns_users = [info[1] for info in cursor.fetchall()]
        
        if 'phone' not in columns_users:
            print("Adding phone column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20)")
            
        if 'bio' not in columns_users:
            print("Adding bio column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN bio TEXT")
            
        if 'avatar_url' not in columns_users:
            print("Adding avatar_url column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255)")
            
        if 'plan_type' not in columns_users:
            print("Adding plan_type column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN plan_type VARCHAR(20)")

        conn.commit()
        conn.close()
        print("Database fix completed.")
        
    except Exception as e:
        print(f"Error fixing database: {e}")

if __name__ == "__main__":
    fix_database()
