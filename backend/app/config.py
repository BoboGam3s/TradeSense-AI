"""
TradeSense AI - Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Flask application configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///tradesense.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
    
    # Google Gemini AI
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')
    
    # Email Configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@tradesense.ai')
    
    # Frontend URL for email links
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    
    # PayPal
    PAYPAL_MODE = os.getenv('PAYPAL_MODE', 'sandbox')
    PAYPAL_CLIENT_ID = os.getenv('PAYPAL_CLIENT_ID', '')
    PAYPAL_CLIENT_SECRET = os.getenv('PAYPAL_CLIENT_SECRET', '')
    
    # Challenge Settings
    INITIAL_CHALLENGE_BALANCE = float(os.getenv('INITIAL_CHALLENGE_BALANCE', 5000))
    MAX_DAILY_LOSS_PERCENT = float(os.getenv('MAX_DAILY_ LOSS_PERCENT', 5))
    MAX_TOTAL_LOSS_PERCENT = float(os.getenv('MAX_TOTAL_LOSS_PERCENT', 10))
    PROFIT_TARGET_PERCENT = float(os.getenv('PROFIT_TARGET_PERCENT', 10))
