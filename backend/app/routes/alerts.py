from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import PriceAlert
from app.extensions import mongo
from bson import ObjectId
from datetime import datetime

bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

@bp.route('', methods=['GET'])
@jwt_required()
def get_alerts():
    """Get active alerts for current user"""
    user_id = get_jwt_identity()
    cursor = mongo.db.price_alerts.find({'user_id': user_id, 'is_active': True})
    alerts = [PriceAlert(**a).to_dict() for a in cursor]
    return jsonify(alerts), 200

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
        condition=data['condition']
    )
    
    alert_data = alert.to_dict()
    if 'id' in alert_data: del alert_data['id']
    alert_data['created_at'] = datetime.utcnow()
    
    result = mongo.db.price_alerts.insert_one(alert_data)
    alert.id = str(result.inserted_id)
    
    return jsonify(alert.to_dict()), 201

@bp.route('/<string:alert_id>', methods=['DELETE'])
@jwt_required()
def delete_alert(alert_id):
    """Delete an alert"""
    user_id = get_jwt_identity()
    result = mongo.db.price_alerts.delete_one({'_id': ObjectId(alert_id), 'user_id': user_id})
    
    if result.deleted_count == 0:
        return jsonify({'error': 'Alert not found'}), 404
        
    return jsonify({'message': 'Alert deleted'}), 200
