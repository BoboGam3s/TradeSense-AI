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
    try:
        # Get all active and passed challenges with their users in a single query
        # We group by user to only show their best challenge
        from sqlalchemy import func
        
        # Subquery to find the max current_equity per user_id for active/passed challenges
        subquery = db.session.query(
            Challenge.user_id,
            func.max(Challenge.current_equity).label('max_equity')
        ).filter(
            Challenge.status.in_(['active', 'passed'])
        ).group_by(Challenge.user_id).subquery()

        # Join with User and Challenge to get the full data
        results = db.session.query(User, Challenge)\
            .join(Challenge, User.id == Challenge.user_id)\
            .join(subquery, (Challenge.user_id == subquery.c.user_id) & (Challenge.current_equity == subquery.c.max_equity))\
            .filter(Challenge.status.in_(['active', 'passed']))\
            .order_by(desc(Challenge.current_equity))\
            .limit(10)\
            .all()
        
        leaderboard_data = []
        for idx, (user, challenge) in enumerate(results, start=1):
            profit_percent = challenge.calculate_profit_percent()
            leaderboard_data.append({
                'rank': idx,
                'user_name': user.full_name,
                'profit_percent': round(profit_percent, 2),
                'total_profit': round(challenge.calculate_total_profit(), 2),
                'plan_type': challenge.plan_type,
                'status': challenge.status
            })
        
        return jsonify({
            'leaderboard': leaderboard_data,
            'total_traders': len(leaderboard_data)
        }), 200
    except Exception as e:
        import traceback
        print(f"Error in leaderboard: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to load leaderboard', 'details': str(e)}), 500


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
