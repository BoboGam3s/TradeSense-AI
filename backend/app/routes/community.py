from flask import Blueprint, jsonify
from app.models import User
import random

bp = Blueprint('community', __name__)

@bp.route('/users', methods=['GET'])
def get_community_users():
    """Get a mix of real and imaginary users for the community zone"""
    # Get some real users
    real_users = User.query.limit(5).all()
    user_list = []
    
    for user in real_users:
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
