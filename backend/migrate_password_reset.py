"""
Add password reset fields to users table
"""
from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    try:
        with db.engine.connect() as conn:
            # Check if columns exist first
            result = conn.execute(db.text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result]
            
            if 'reset_token' not in columns:
                print("Adding reset_token column...")
                conn.execute(db.text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(100)"))
                conn.commit()
                print("✅ Added reset_token column")
            else:
                print("✓ reset_token column already exists")
            
            if 'reset_token_expires' not in columns:
                print("Adding reset_token_expires column...")
                conn.execute(db.text("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME"))
                conn.commit()
                print("✅ Added reset_token_expires column")
            else:
                print("✓ reset_token_expires column already exists")
        
        print("\n🎉 Password reset migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        raise
