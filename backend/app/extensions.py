"""
TradeSense AI - Flask Extensions
"""
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from apscheduler.schedulers.background import BackgroundScheduler

# Initialize extensions
mongo = PyMongo()
jwt = JWTManager()
scheduler = BackgroundScheduler()
