"""
TradeSense AI - Challenge Routes (MongoDB Version)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Challenge
from app.extensions import mongo
from bson import ObjectId

bp = Blueprint('challenge', __name__)

@bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_challenge():
    """Get user's current active challenge"""
    user_id = get_jwt_identity()
    challenge_doc = mongo.db.challenges.find_one({
        'user_id': user_id,
        'status': 'active'
    })
    
    if not challenge_doc:
        return jsonify({'error': 'No active challenge found'}), 404
    
    return jsonify({'challenge': Challenge(**challenge_doc).to_dict()}), 200

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_challenge_history():
    """Get user's challenge history"""
    user_id = get_jwt_identity()
    cursor = mongo.db.challenges.find({'user_id': user_id}).sort('created_at', -1)
    challenges = [Challenge(**c).to_dict() for c in cursor]
    
    return jsonify({
        'total': len(challenges),
        'challenges': challenges
    }), 200

@bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top 10 traders by profit percentage (MongoDB Aggregation)"""
    try:
        pipeline = [
            # 1. Match active/passed challenges
            {'$match': {'status': {'$in': ['active', 'passed']}}},
            # 2. Sort by equity to get best per user first
            {'$sort': {'current_equity': -1}},
            # 3. Group by user_id to get only their best challenge
            {'$group': {
                '_id': '$user_id',
                'best_challenge': {'$first': '$$ROOT'}
            }},
            # 4. Sort again by equity of the best challenge
            {'$sort': {'best_challenge.current_equity': -1}},
            # 5. Take top 10
            {'$limit': 10}
        ]
        
        results = list(mongo.db.challenges.aggregate(pipeline))
        leaderboard_data = []
        
        for idx, item in enumerate(results, start=1):
            challenge_doc = item['best_challenge']
            challenge = Challenge(**challenge_doc)
            user_doc = mongo.db.users.find_one({'_id': ObjectId(challenge.user_id)})
            
            leaderboard_data.append({
                'rank': idx,
                'user_name': user_doc.get('full_name', 'Unknown') if user_doc else 'Unknown',
                'profit_percent': round(challenge.calculate_profit_percent(), 2),
                'total_profit': round(challenge.calculate_total_profit(), 2),
                'plan_type': challenge.plan_type,
                'status': challenge.status
            })
        
        return jsonify({
            'leaderboard': leaderboard_data,
            'total_traders': len(leaderboard_data)
        }), 200
    except Exception as e:
        print(f"Error in leaderboard aggregation: {e}")
        return jsonify({'error': 'Failed to load leaderboard'}), 500

@bp.route('/verify/<string:challenge_id>', methods=['POST'])
@jwt_required()
def verify_challenge(challenge_id):
    """Manually trigger challenge verification"""
    user_id = get_jwt_identity()
    challenge_doc = mongo.db.challenges.find_one({'_id': ObjectId(challenge_id)})
    
    if not challenge_doc:
        return jsonify({'error': 'Challenge not found'}), 404
    
    if challenge_doc['user_id'] != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    from app.services.challenge_engine import ChallengeEngine
    result = ChallengeEngine.verify_challenge_rules(challenge_id)
    
    return jsonify({
        'message': 'Challenge verified',
        'verification': result
    }), 200
