"""
TradeSense AI - Flask Application Factory
"""
from flask import Flask
import os
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt, migrate, scheduler
from app.routes import auth, trading, challenge, payment, admin, market, alerts, community
from app.models import User


def create_app(config_class=Config):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    # Enable CORS for all routes and origins
    # Configure CORS to handle preflight OPTIONS requests properly
    CORS(app, 
         resources={
             r"/*": {
                 "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "*.onrender.com", "*.vercel.app"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization"],
                 "expose_headers": ["Content-Type", "Authorization"],
                 "max_age": 3600
             }
         },
         supports_credentials=True,
         send_wildcard=False, # Must be False for credentials with specific origins
         always_send=True,
         automatic_options=True
    )
    
    @app.after_request
    def after_request(response):
        # Additional debug logging for CORS
        if os.environ.get('FLASK_DEBUG') == '1' and request.method == 'OPTIONS':
            print(f"DEBUG: Handling preflight {request.method} {request.path}")
            print(f"DEBUG: Origin: {request.headers.get('Origin')}")
        return response
    
    
    # Register blueprints
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(trading.bp, url_prefix='/api/trading')
    app.register_blueprint(challenge.bp, url_prefix='/api/challenge')
    app.register_blueprint(payment.bp, url_prefix='/api/payment')
    app.register_blueprint(admin.bp, url_prefix='/api/admin')
    app.register_blueprint(market.bp, url_prefix='/api/market')
    app.register_blueprint(alerts.bp, url_prefix='/api/alerts')
    app.register_blueprint(community.bp, url_prefix='/api/community')
    

    # Seeding admin if no users exist (MongoDB version)
    with app.app_context():
        try:
            if mongo.db.users.count_documents({}) == 0:
                print("Database is empty. Seeding admin user...")
                from app.models import User
                admin_user = User(
                    email='admin@tradesense.ai',
                    full_name='Admin User',
                    role='admin',
                    language='fr'
                )
                admin_user.set_password('admin123')
                mongo.db.users.insert_one(admin_user.to_dict())
                print("Admin user created: admin@tradesense.ai / admin123")
        except Exception as e:
            print(f"WARNING: MongoDB initialization/seeding failed: {e}")
    
    # Start background scheduler for challenge verification
    # if not scheduler.running:
    #     try:
    #         scheduler.start()
    #         # Add job to verify challenges every 5 minutes
    #         from app.services.challenge_engine import verify_all_active_challenges
    #         scheduler.add_job(
    #             id='verify_challenges',
    #             func=verify_all_active_challenges,
    #             trigger='interval',
    #             minutes=5,
    #             replace_existing=True
    #         )
    #     except Exception as e:
    #         print(f"WARNING: Scheduler failed to start: {e}")
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'TradeSense AI is running'}
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        # Pass through HTTP errors
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            return e
        
        # Log non-HTTP exceptions
        import traceback
        print(f"FATAL ERROR: {str(e)}")
        traceback.print_exc()
        return {"error": "Internal Server Error", "details": str(e)}, 500
    
    # Debug: Print all registered routes
    with app.app_context():
        print("DEBUG: Registered Routes:")
        for rule in app.url_map.iter_rules():
            print(f"DEBUG: {rule} methods={rule.methods}")

    return app

