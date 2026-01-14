from app import create_app
from app.models import PaymentConfig

app = create_app()
with app.app_context():
    config = PaymentConfig.query.first()
    if config:
        print(f"PayPal Client ID: {config.paypal_client_id}")
        print(f"Is Live: {config.is_live}")
    else:
        print("No PaymentConfig found")
