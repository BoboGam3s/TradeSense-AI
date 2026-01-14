from app import create_app
from app.models import User

app = create_app()
with app.app_context():
    for u in User.query.all():
        print(f"{u.id}: {u.email} ({u.plan_type})")
