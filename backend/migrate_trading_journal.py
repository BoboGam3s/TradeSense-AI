"""
Add trading journal fields to trades table
"""
from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    try:
        with db.engine.connect() as conn:
            # Check if columns exist first
            result = conn.execute(db.text("PRAGMA table_info(trades)"))
            columns = [row[1] for row in result]
            
            if 'notes' not in columns:
                print("Adding notes column...")
                conn.execute(db.text("ALTER TABLE trades ADD COLUMN notes TEXT"))
                conn.commit()
                print("✅ Added notes column")
            else:
                print("✓ notes column already exists")
            
            if 'tags' not in columns:
                print("Adding tags column...")
                conn.execute(db.text("ALTER TABLE trades ADD COLUMN tags VARCHAR(255)"))
                conn.commit()
                print("✅ Added tags column")
            else:
                print("✓ tags column already exists")
                
            if 'screenshot_url' not in columns:
                print("Adding screenshot_url column...")
                conn.execute(db.text("ALTER TABLE trades ADD COLUMN screenshot_url VARCHAR(255)"))
                conn.commit()
                print("✅ Added screenshot_url column")
            else:
                print("✓ screenshot_url column already exists")
        
        print("\n🎉 Trading Journal migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        raise
