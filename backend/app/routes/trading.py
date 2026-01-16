"""
TradeSense AI - Trading Routes (MongoDB Version)
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Challenge, Trade
from app.extensions import mongo
from app.services.market_data import MarketDataService
from app.services.challenge_engine import ChallengeEngine
from app.services.ai_service import AIService
from datetime import datetime
from bson import ObjectId
import threading

bp = Blueprint('trading', __name__)

def get_portfolio_internal(challenge_id):
    """
    Get all independent open orders for MT4-style management.
    """
    open_trades_cursor = mongo.db.trades.find({
        'challenge_id': challenge_id, 
        'is_open': True
    }).sort('timestamp', -1)
    
    positions = []
    for t_doc in open_trades_cursor:
        t = Trade(**t_doc)
        positions.append({
            'id': t.id,
            'symbol': t.symbol,
            'action': t.action,
            'quantity': round(t.quantity, 6),
            'price': round(t.price, 4),
            'timestamp': t.timestamp.isoformat() if isinstance(t.timestamp, datetime) else t.timestamp
        })
            
    return {'positions': positions}

@bp.route('/portfolio', methods=['GET'])
@jwt_required()
def get_portfolio():
    """Get user's active challenge and portfolio"""
    user_id = get_jwt_identity()
    
    # Get latest challenge
    challenge_doc = mongo.db.challenges.find_one(
        {'user_id': user_id},
        sort=[('created_at', -1)]
    )
    
    if not challenge_doc:
        return jsonify({'error': 'No active challenge found'}), 404
    
    challenge = Challenge(**challenge_doc)
    
    # Get recent trades
    recent_trades_cursor = mongo.db.trades.find(
        {'challenge_id': challenge.id}
    ).sort('timestamp', -1).limit(10)
    
    recent_trades = [Trade(**t).to_dict() for t in recent_trades_cursor]
    
    # Calculate positions
    portfolio_data = get_portfolio_internal(challenge.id)
    
    return jsonify({
        'challenge': challenge.to_dict(),
        'positions': portfolio_data['positions'],
        'recent_trades': recent_trades
    }), 200

@bp.route('/execute', methods=['POST'])
@jwt_required()
def execute_trade():
    """Execute a trade with cash balance deduction/addition"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    symbol = data.get('symbol')
    action = data.get('action', '').lower() 
    quantity = float(data.get('quantity', 0))
    
    if not symbol or not action or quantity <= 0:
        return jsonify({'error': 'Données de trade invalides'}), 400
    
    challenge_doc = mongo.db.challenges.find_one(
        {'user_id': user_id},
        sort=[('created_at', -1)]
    )
    if not challenge_doc:
        return jsonify({'error': 'Aucun challenge trouvé. Veuillez en choisir un.'}), 404
    
    challenge = Challenge(**challenge_doc)
        
    # Allow trading if active or passed (to keep trading after winning)
    if challenge.status not in ['active', 'passed']:
        return jsonify({
            'error': f'Challenge {challenge.status.upper()}. Trading is suspended.',
            'challenge_status': challenge.status,
            'message': 'Please reset your account or upgrade your plan to continue trading.'
        }), 400
        
    is_open, market_msg = MarketDataService.is_market_open(symbol)
    if not is_open:
        return jsonify({'error': f'Marché fermé pour {symbol}. {market_msg}.'}), 400

    price_data = MarketDataService.get_realtime_price(symbol)
    if not price_data or price_data.get('price') == 0:
        return jsonify({'error': 'Impossible de récupérer le prix actuel'}), 400
    
    current_price = price_data['price']
    
    # LOT LOGIC
    lot_multiplier = 1.0
    if '=X' in symbol: lot_multiplier = 100000.0
    elif '.CS' in symbol or symbol in ['AAPL', 'TSLA', 'GOOGL', 'MSFT']: lot_multiplier = 10.0
    
    quantity_units = quantity * lot_multiplier
    trade_value = current_price * quantity_units
    
    # LEVERAGE LOGIC: 1:100
    leverage = 100.0
    required_margin = trade_value / leverage

    # BUYING POWER
    portfolio_pre = get_portfolio_internal(challenge.id)
    open_pl = 0
    for pos in portfolio_pre['positions']:
        p_data = MarketDataService.get_realtime_price(pos['symbol'])
        if p_data:
            curl_p = p_data['price']
            if pos['action'] == 'buy':
                open_pl += (curl_p - pos['price']) * pos['quantity']
            else:
                open_pl += (pos['price'] - curl_p) * pos['quantity']
            
    buying_power = challenge.current_equity + open_pl

    if required_margin > buying_power:
        return jsonify({
            'error': f'Marge insuffisante ($ {required_margin:.2f} requis, équité $ {buying_power:.2f})',
            'required_margin': required_margin,
            'buying_power': buying_power
        }), 400
    
    # Create Trade
    trade = Trade(
        challenge_id=challenge.id,
        symbol=symbol,
        action=action,
        quantity=quantity_units,
        price=current_price,
        is_open=True
    )
    
    try:
        trade_dict = trade.to_dict()
        if 'id' in trade_dict: del trade_dict['id']
        trade_dict['timestamp'] = datetime.utcnow()
        result = mongo.db.trades.insert_one(trade_dict)
        trade.id = str(result.inserted_id)
        
        # Background verification
        app_obj = current_app._get_current_object()
        def bg_tasks(cid):
            with app_obj.app_context():
                ChallengeEngine.verify_challenge_rules(cid)
        threading.Thread(target=bg_tasks, args=(challenge.id,)).start()
        
        # Return state
        updated_portfolio = get_portfolio_internal(challenge.id)
        recent_trades_cursor = mongo.db.trades.find({'challenge_id': challenge.id}).sort('timestamp', -1).limit(10)
        recent_trades = [Trade(**t).to_dict() for t in recent_trades_cursor]

        return jsonify({
            'message': 'Trade exécuté',
            'trade': trade.to_dict(),
            'challenge': challenge.to_dict(),
            'positions': updated_portfolio['positions'],
            'recent_trades': recent_trades,
            'status': 'success'
        }), 201
    except Exception as e:
        print(f"CRITICAL TRADE ERROR: {str(e)}")
        return jsonify({'error': f'Erreur lors du trade: {str(e)}'}), 500


@bp.route('/close', methods=['POST'])
@jwt_required()
def close_position():
    """Close a specific independent order"""
    user_id = get_jwt_identity()
    data = request.get_json()
    trade_id = data.get('trade_id')
    
    if not trade_id:
        return jsonify({'error': 'ID de transaction requis'}), 400
        
    challenge_doc = mongo.db.challenges.find_one({'user_id': user_id}, sort=[('created_at', -1)])
    if not challenge_doc:
        return jsonify({'error': 'Aucun challenge trouvé'}), 404
    challenge = Challenge(**challenge_doc)

    trade_doc = mongo.db.trades.find_one({'_id': ObjectId(trade_id), 'challenge_id': challenge.id, 'is_open': True})
    if not trade_doc:
        return jsonify({'error': 'Position non trouvée'}), 404
    trade = Trade(**trade_doc)
        
    price_data = MarketDataService.get_realtime_price(trade.symbol)
    if not price_data:
        return jsonify({'error': 'Impossible de récupérer le prix actuel'}), 400
    current_price = price_data['price']
    
    # Calculate P/L
    if trade.action.lower() == 'buy':
        pl = (current_price - trade.price) * trade.quantity
    else:
        pl = (trade.price - current_price) * trade.quantity
    
    # Update balance and close trade
    new_equity = challenge.current_equity + pl
    mongo.db.challenges.update_one({'_id': ObjectId(challenge.id)}, {'$set': {'current_equity': new_equity}})
    
    mongo.db.trades.update_one(
        {'_id': ObjectId(trade.id)},
        {'$set': {
            'is_open': False,
            'close_price': current_price,
            'profit_loss': pl
        }}
    )
    
    # Background verification
    app_obj = current_app._get_current_object()
    def verify_bg(cid):
        with app_obj.app_context():
            ChallengeEngine.verify_challenge_rules(cid)
    threading.Thread(target=verify_bg, args=(challenge.id,)).start()
    
    updated_portfolio = get_portfolio_internal(challenge.id)
    recent_cursor = mongo.db.trades.find({'challenge_id': challenge.id}).sort('timestamp', -1).limit(10)
    recent_trades = [Trade(**t).to_dict() for t in recent_cursor]

    return jsonify({
        'message': f'Position {trade.symbol} fermée',
        'challenge': Challenge(**mongo.db.challenges.find_one({'_id': ObjectId(challenge.id)})).to_dict(),
        'positions': updated_portfolio['positions'],
        'recent_trades': recent_trades,
        'status': 'success'
    }), 200

@bp.route('/close-all', methods=['POST'])
@jwt_required()
def close_all_positions():
    """Close all open positions"""
    user_id = get_jwt_identity()
    challenge_doc = mongo.db.challenges.find_one({'user_id': user_id}, sort=[('created_at', -1)])
    if not challenge_doc:
        return jsonify({'error': 'No active challenge found'}), 404
    challenge = Challenge(**challenge_doc)
    
    open_trades_cursor = mongo.db.trades.find({'challenge_id': challenge.id, 'is_open': True})
    total_pl = 0
    closed_count = 0
    
    for t_doc in open_trades_cursor:
        trade = Trade(**t_doc)
        price_data = MarketDataService.get_realtime_price(trade.symbol)
        curr_p = price_data['price'] if price_data else trade.price
        
        if trade.action.lower() == 'buy':
            pl = (curr_p - trade.price) * trade.quantity
        else:
            pl = (trade.price - curr_p) * trade.quantity
            
        mongo.db.trades.update_one(
            {'_id': ObjectId(trade.id)},
            {'$set': {'is_open': False, 'close_price': curr_p, 'profit_loss': pl}}
        )
        total_pl += pl
        closed_count += 1
        
    new_equity = challenge.current_equity + total_pl
    mongo.db.challenges.update_one({'_id': ObjectId(challenge.id)}, {'$set': {'current_equity': new_equity}})
    
    # Background verify
    app_obj = current_app._get_current_object()
    def verify_bg(cid):
        with app_obj.app_context():
            ChallengeEngine.verify_challenge_rules(cid)
    threading.Thread(target=verify_bg, args=(challenge.id,)).start()
    
    updated_portfolio = get_portfolio_internal(challenge.id)
    recent_cursor = mongo.db.trades.find({'challenge_id': challenge.id}).sort('timestamp', -1).limit(10)
    
    return jsonify({
        'message': f'{closed_count} positions fermées',
        'total_pl': round(total_pl, 2),
        'challenge': Challenge(**mongo.db.challenges.find_one({'_id': ObjectId(challenge.id)})).to_dict(),
        'positions': updated_portfolio['positions'],
        'recent_trades': [Trade(**t).to_dict() for t in recent_cursor],
        'status': 'success'
    }), 200

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's trading history"""
    user_id = get_jwt_identity()
    challenge_doc = mongo.db.challenges.find_one({'user_id': user_id}, sort=[('created_at', -1)])
    if not challenge_doc:
        return jsonify({'error': 'No active challenge found'}), 404
    
    query = {'challenge_id': str(challenge_doc['_id'])}
    tag_filter = request.args.get('tag')
    if tag_filter:
        query['tags'] = tag_filter # MongoDB handles arrays automatically if we use tags as a list
        
    trades_cursor = mongo.db.trades.find(query).sort('timestamp', -1)
    trades = [Trade(**t).to_dict() for t in trades_cursor]
    
    return jsonify({
        'challenge_id': str(challenge_doc['_id']),
        'total_trades': len(trades),
        'trades': trades
    }), 200

@bp.route('/performance-analysis', methods=['POST'])
@jwt_required()
def get_performance_analysis():
    """Get AI-powered performance analysis"""
    user_id = get_jwt_identity()
    challenge_doc = mongo.db.challenges.find_one({'user_id': user_id}, sort=[('created_at', -1)])
    if not challenge_doc:
        return jsonify({'error': 'No active challenge found'}), 404
    
    trades_cursor = mongo.db.trades.find({'challenge_id': str(challenge_doc['_id'])})
    trades = [Trade(**t).to_dict() for t in trades_cursor]
    
    try:
        analysis = AIService.generate_trade_analysis(
            trades,
            challenge_doc['current_equity'],
            challenge_doc['initial_balance']
        )
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_trading_stats():
    """Get detailed trading statistics"""
    user_id = get_jwt_identity()
    challenge_doc = mongo.db.challenges.find_one({'user_id': user_id}, sort=[('created_at', -1)])
    if not challenge_doc:
        return jsonify({'error': 'No active challenge found'}), 404
    
    challenge = Challenge(**challenge_doc)
    trades_cursor = mongo.db.trades.find({'challenge_id': challenge.id}).sort('timestamp', 1)
    trades = [Trade(**t) for t in trades_cursor]
    
    if not trades:
        return jsonify({'total_trades': 0}), 200
            
    # Calculate stats
    wins = [t for t in trades if t.profit_loss > 0]
    losses = [t for t in trades if t.profit_loss <= 0]
    
    total_trades = len(trades)
    win_rate = (len(wins) / total_trades * 100) if total_trades > 0 else 0
    gross_profit = sum(t.profit_loss for t in wins)
    gross_loss = abs(sum(t.profit_loss for t in losses))
    profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else gross_profit
    
    equity_curve = [{'time': int(challenge.created_at.timestamp()), 'value': challenge.initial_balance}]
    running_balance = challenge.initial_balance
    daily_pl = {}
    
    for t in trades:
        running_balance += t.profit_loss
        equity_curve.append({'time': int(t.timestamp.timestamp()), 'value': running_balance})
        day_str = t.timestamp.strftime('%Y-%m-%d')
        daily_pl[day_str] = daily_pl.get(day_str, 0) + t.profit_loss
            
    daily_pl_list = sorted([{'time': k, 'value': v} for k, v in daily_pl.items()], key=lambda x: x['time'])
    
    return jsonify({
        'total_trades': total_trades,
        'win_rate': round(win_rate, 2),
        'profit_factor': profit_factor,
        'avg_win': round(gross_profit / len(wins), 2) if wins else 0,
        'avg_loss': round(gross_loss / len(losses), 2) if losses else 0,
        'equity_curve': equity_curve,
        'daily_pl': daily_pl_list
    }), 200
