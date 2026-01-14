import app
from app import create_app, db
from app.models import User
from sqlalchemy import text
import uuid

def migrate():
    app = create_app()
    with app.app_context():
        print("Starting Referral Program migration...")
        
        # 1. Add columns if they don't exist
        with db.engine.connect() as conn:
            # Check if columns exist to avoid errors
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            
            if 'referral_code' not in columns:
                print("Adding referral_code column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN referral_code VARCHAR(20)"))
            
            if 'referred_by_id' not in columns:
                print("Adding referred_by_id column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN referred_by_id INTEGER REFERENCES users(id)"))
                
            if 'referral_credits' not in columns:
                print("Adding referral_credits column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN referral_credits INTEGER DEFAULT 0"))
                
            conn.commit()
            print("Columns added successfully.")

        # 2. Generate referral codes for existing users
        users = User.query.filter(User.referral_code == None).all()
        print(f"Found {len(users)} users without referral codes.")
        
        for user in users:
            # Generate simple 8-char code
            code = uuid.uuid4().hex[:8].upper()
            # Ensure uniqueness (simple check)
            while User.query.filter_by(referral_code=code).first():
                code = uuid.uuid4().hex[:8].upper()
                
            user.referral_code = code
            print(f"Generated code {code} for user {user.email}")
            
        try:
            db.session.commit()
            print("Migration completed successfully!")
        except Exception as e:
            db.session.rollback()
            print(f"Error saving changes: {e}")

if __name__ == "__main__":
    migrate()
