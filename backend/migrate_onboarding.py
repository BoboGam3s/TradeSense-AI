import app
from app import create_app, db
from sqlalchemy import text

def migrate():
    app = create_app()
    with app.app_context():
        print("Starting Onboarding migration...")
        
        with db.engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            
            if 'has_completed_onboarding' not in columns:
                print("Adding has_completed_onboarding column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT 0"))
                conn.commit()
                print("Column added successfully.")
            else:
                print("Column has_completed_onboarding already exists.")
                
        print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
