"""
TradeSense AI - Challenge Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Challenge
from app.extensions import db
from sqlalchemy import desc

bp = Blueprint('challenge', __name__)


@bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_challenge():
    """Get user's current active challenge"""
    user_id = get_jwt_identity()
    
    challenge = Challenge.query.filter_by(
        user_id=user_id,
        status='active'
    ).first()
    
    if not challenge:
        return jsonify({'error': 'No active challenge found'}), 404
    
    return jsonify({'challenge': challenge.to_dict()}), 200


@bp.route('/history', methods=['GET'])
@jwt_required()
def get_challenge_history():
    """Get user's challenge history"""
    user_id = get_jwt_identity()
    
    challenges = Challenge.query.filter_by(user_id=user_id)\
        .order_by(Challenge.created_at.desc())\
        .all()
    
    return jsonify({
        'total': len(challenges),
        'challenges': [c.to_dict() for c in challenges]
    }), 200


@bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top 10 traders by profit percentage"""
    # Get all active and passed challenges
    challenges = Challenge.query.filter(
        Challenge.status.in_(['active', 'passed'])
    ).all()
    
    # Calculate profit % and sort
    leaderboard_data = []
    for challenge in challenges:
        user = User.query.get(challenge.user_id)
        if user:
            profit_percent = challenge.calculate_profit_percent()
            leaderboard_data.append({
                'rank': 0,  # Will be set after sorting
                'user_name': user.full_name,
                'profit_percent': round(profit_percent, 2),
                'total_profit': round(challenge.calculate_total_profit(), 2),
                'plan_type': challenge.plan_type,
                'status': challenge.status
            })
    
    # Sort by profit percentage
    leaderboard_data.sort(key=lambda x: x['profit_percent'], reverse=True)
    
    # Assign ranks
    for idx, entry in enumerate(leaderboard_data[:10], start=1):
        entry['rank'] = idx
    
    return jsonify({
        'leaderboard': leaderboard_data[:10],
        'total_traders': len(leaderboard_data)
    }), 200


@bp.route('/verify/<int:challenge_id>', methods=['POST'])
@jwt_required()
def verify_challenge(challenge_id):
    """Manually trigger challenge verification"""
    user_id = get_jwt_identity()
    
    challenge = Challenge.query.get(challenge_id)
    
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    if challenge.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    from app.services.challenge_engine import ChallengeEngine
    result = ChallengeEngine.verify_challenge_rules(challenge_id)
    
    return jsonify({
        'message': 'Challenge verified',
        'verification': result
    }), 200
