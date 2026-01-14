from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import PriceAlert, db
from datetime import datetime

bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

@bp.route('', methods=['GET'])
@jwt_required()
def get_alerts():
    """Get active alerts for current user"""
    user_id = get_jwt_identity()
    alerts = PriceAlert.query.filter_by(user_id=user_id, is_active=True).all()
    return jsonify([a.to_dict() for a in alerts]), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_alert():
    """Create a new price alert"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('symbol') or not data.get('target_price') or not data.get('condition'):
        return jsonify({'error': 'Missing required fields'}), 400
        
    alert = PriceAlert(
        user_id=user_id,
        symbol=data['symbol'],
        target_price=float(data['target_price']),
        condition=data['condition'] # ABOVE or BELOW
    )
    
    db.session.add(alert)
    db.session.commit()
    
    return jsonify(alert.to_dict()), 201

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_alert(id):
    """Delete (or deactivate) an alert"""
    user_id = get_jwt_identity()
    alert = PriceAlert.query.filter_by(id=id, user_id=user_id).first()
    
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
        
    db.session.delete(alert)
    db.session.commit()
    
    return jsonify({'message': 'Alert deleted'}), 200
