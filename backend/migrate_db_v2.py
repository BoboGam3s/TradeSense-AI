from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Add is_open column
        db.session.execute(text("ALTER TABLE trades ADD COLUMN is_open BOOLEAN DEFAULT 1"))
        print("Success: Added is_open column to trades table")
    except Exception as e:
        print(f"Note: is_open column might already exist or error: {e}")

    try:
        # Add close_price column
        db.session.execute(text("ALTER TABLE trades ADD COLUMN close_price FLOAT"))
        print("Success: Added close_price column to trades table")
    except Exception as e:
        print(f"Note: close_price column might already exist or error: {e}")

    db.session.commit()
    print("Migration complete.")
