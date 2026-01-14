import app
from app import create_app, db
from app.models import PriceAlert
from sqlalchemy import text

def migrate():
    app = create_app()
    with app.app_context():
        print("Starting PriceAlert migration...")
        
        # Create table
        db.create_all()
        print("Database schema updated (PriceAlert table created if not exists).")
        
        # Double check
        with db.engine.connect() as conn:
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='price_alerts'"))
            if result.fetchone():
                print("Confirmed: price_alerts table exists.")
            else:
                print("Error: price_alerts table was not created.")

if __name__ == "__main__":
    migrate()
