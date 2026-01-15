from flask import Blueprint, jsonify
from app.models import User
from app.extensions import mongo
import random

bp = Blueprint('community', __name__)

@bp.route('/users', methods=['GET'])
def get_community_users():
    """Get a mix of real and imaginary users for the community zone"""
    # Get some real users from MongoDB
    cursor = mongo.db.users.find().limit(5)
    user_list = []
    
    for u_doc in cursor:
        user = User(**u_doc)
        user_list.append({
            'id': f"real_{user.id}",
            'name': user.full_name.split()[0] + "_" + str(random.randint(10, 99)),
            'is_real': True,
            'role': user.role,
            'avatar': user.avatar_url
        })
    
    # Add imaginary users
    imaginary_names = ["AlphaTrader", "MarketWhale", "PipsHunter", "BullRun2026", "ChartMaster"]
    for i, name in enumerate(imaginary_names):
        user_list.append({
            'id': f"mock_{i}",
            'name': name,
            'is_real': False,
            'role': 'user',
            'avatar': None
        })
        
    random.shuffle(user_list)
    return jsonify(user_list), 200
