"""
Add email verification fields to users table
"""
from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    # Add new columns to users table
    try:
        with db.engine.connect() as conn:
            # Check if columns exist first
            result = conn.execute(db.text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result]
            
            if 'email_verified' not in columns:
                print("Adding email_verified column...")
                conn.execute(db.text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0"))
                conn.commit()
                print("✅ Added email_verified column")
            else:
                print("✓ email_verified column already exists")
            
            if 'verification_token' not in columns:
                print("Adding verification_token column...")
                conn.execute(db.text("ALTER TABLE users ADD COLUMN verification_token VARCHAR(100)"))
                conn.commit()
                print("✅ Added verification_token column")
            else:
                print("✓ verification_token column already exists")
            
            if 'verification_token_expires' not in columns:
                print("Adding verification_token_expires column...")
                conn.execute(db.text("ALTER TABLE users ADD COLUMN verification_token_expires DATETIME"))
                conn.commit()
                print("✅ Added verification_token_expires column")
            else:
                print("✓ verification_token_expires column already exists")
        
        print("\n🎉 Database migration completed successfully!")
        print("You can now register users with email verification.")
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        raise
