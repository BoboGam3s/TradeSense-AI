from app import create_app, db
from app.models import User

app = create_app()
with app.app_context():
    admin = User.query.filter_by(email="admin@tradesense.ai").first()
    if admin:
        print(f"Resetting password for {admin.email}...")
        admin.set_password("admin123")
        db.session.commit()
        print("Password reset successful.")
    else:
        print("Admin user not found. Creating one...")
        admin = User(
            email="admin@tradesense.ai",
            full_name="Administrator",
            role="admin",
            plan_type="elite"
        )
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully.")
