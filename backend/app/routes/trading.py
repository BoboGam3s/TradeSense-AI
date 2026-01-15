"""
TradeSense AI - Trading Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Challenge, Trade
from app.extensions import db
from app.services.market_data import MarketDataService
from app.services.challenge_engine import ChallengeEngine
from app.services.ai_service import AIService
from datetime import datetime
from flask import current_app

bp = Blueprint('trading', __name__)


@bp.route('/portfolio', methods=['GET'])
@jwt_required()
def get_portfolio():
    """Get user's active challenge and portfolio"""
    user_id = int(get_jwt_identity())
    
    # Get latest challenge (active, passed, or failed) to allow persistence
    challenge = Challenge.query.filter_by(
        user_id=user_id
    ).order_by(Challenge.created_at.desc()).first()
    
    if not challenge:
        return jsonify({'error': 'No active challenge found'}), 404
    
    # Get ALL trades to calculate positions correctly
    # And latest 10 for the UI history
    all_trades = Trade.query.filter_by(challenge_id=challenge.id).all()
    recent_trades = Trade.query.filter_by(challenge_id=challenge.id)\
        .order_by(Trade.timestamp.desc())\
        .limit(10)\
        .all()
    
    # Calculate positions from all history
    portfolio_data = get_portfolio_internal(challenge.id)
    
    return jsonify({
        'challenge': challenge.to_dict(),
        'positions': portfolio_data['positions'],
        'recent_trades': [t.to_dict() for t in recent_trades]
    }), 200


@bp.route('/execute', methods=['POST'])
@jwt_required()
def execute_trade():
    """Execute a trade with cash balance deduction/addition"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    symbol = data.get('symbol')
    action = data.get('action', '').lower() 
    quantity = float(data.get('quantity', 0))
    
    if not symbol or not action or quantity <= 0:
        return jsonify({'error': 'Données de trade invalides'}), 400
    
    challenge = Challenge.query.filter_by(user_id=user_id).order_by(Challenge.created_at.desc()).first()
    if not challenge:
        return jsonify({'error': 'Aucun challenge trouvé. Veuillez en choisir un.'}), 404
        
    if challenge.status != 'active':
        return jsonify({
            'error': f'Challenge {challenge.status.upper()}. Trading is suspended.',
            'challenge_status': challenge.status,
            'message': 'Please reset your account or upgrade your plan to continue trading.'
        }), 403
        
    is_open, market_msg = MarketDataService.is_market_open(symbol)
    if not is_open:
        return jsonify({'error': f'Marché fermé pour {symbol}. {market_msg}.'}), 400

    price_data = MarketDataService.get_realtime_price(symbol)
    if not price_data or price_data.get('price') == 0:
        return jsonify({'error': 'Impossible de récupérer le prix actuel'}), 400
    
    current_price = price_data['price']
    
    # LOT LOGIC: Standardize trade sizes
    # Forex: 1 Lot = 100,000 units | Stocks: 1 Lot = 10 units | Crypto/Others: 1 Lot = 1 unit
    lot_multiplier = 1.0
    if '=X' in symbol:  # Forex
        lot_multiplier = 100000.0
    elif '.CS' in symbol or symbol in ['AAPL', 'TSLA', 'GOOGL', 'MSFT']: # Stocks
        lot_multiplier = 10.0
    elif '=F' in symbol: # Commodities
        lot_multiplier = 1.0 # Standardize to 1 unit per lot for simplicity in simulated environment
    
    quantity_units = quantity * lot_multiplier

    trade_value = current_price * quantity_units
    
    # LEVERAGE LOGIC: 1:100
    leverage = 100.0
    required_margin = trade_value / leverage

    # Get current position for Buying Power
    portfolio_pre = get_portfolio_internal(challenge.id)

    # BUYING POWER: Use Live Equity (Balance + Floating P/L) instead of just current_equity
    # Calculate current open P/L to get real-time buying power
    open_pl = 0
    for pos in portfolio_pre['positions']:
        # IMPORTANT: Use short-term cache to avoid sequential network hits
        try:
            p_data = MarketDataService.get_realtime_price(pos['symbol'])
            if p_data:
                curl_p = p_data['price']
                if pos['action'] == 'buy': # Long
                    open_pl += (curl_p - pos['price']) * pos['quantity']
                else: # Short
                    open_pl += (pos['price'] - curl_p) * abs(pos['quantity'])
        except Exception as e:
            print(f"Buying power calc error for {pos['symbol']}: {str(e)}")
            
    buying_power = challenge.current_equity + open_pl

    # Margin check using Buying Power (Equity)
    if required_margin > buying_power:
        return jsonify({
            'error': f'Marge insuffisante ($ {required_margin:.2f} requis, votre pouvoir d\'achat (Équité) est de $ {buying_power:.2f})',
            'required_margin': required_margin,
            'buying_power': buying_power,
            'leverage': leverage
        }), 400
    
    # MT4 LOGIC: Every trade is a NEW independent order
    trade = Trade(
        challenge_id=challenge.id,
        symbol=symbol,
        action=action,
        quantity=quantity_units, # Store real units in DB
        price=current_price,
        is_open=True # Explicitly open
    )
    
    # Check if this is a mini_funded account to skip rules if needed (Optional)
    # is_mini_funded = challenge.plan_type == 'mini_funded'
    
    try:
        db.session.add(trade)
        db.session.commit()
        
        # Task: Verify rules in background (using NLV)
        app = current_app._get_current_object()
        def bg_tasks(cid):
            try:
                with app.app_context():
                    ChallengeEngine.verify_challenge_rules(cid)
            except Exception as e:
                print(f"Background verification error: {str(e)}")

        import threading
        threading.Thread(target=bg_tasks, args=(challenge.id,)).start()
        
        # Return full state for instant UI update
        updated_portfolio = get_portfolio_internal(challenge.id)
        recent_trades = Trade.query.filter_by(challenge_id=challenge.id)\
            .order_by(Trade.timestamp.desc())\
            .limit(10)\
            .all()

        return jsonify({
            'message': 'Trade exécuté',
            'trade': trade.to_dict(),
            'challenge': challenge.to_dict(),
            'positions': updated_portfolio['positions'],
            'recent_trades': [t.to_dict() for t in recent_trades],
            'status': 'success'
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"CRITICAL TRADE ERROR: {str(e)}")
        return jsonify({'error': f'Erreur lors du trade: {str(e)}'}), 500


@bp.route('/close', methods=['POST'])
@jwt_required()
def close_position():
    """Close a specific independent order and update capital"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    trade_id = data.get('trade_id')
    price = data.get('price') # Optional: passed from frontend for zero-latency feel
    
    if not trade_id:
        return jsonify({'error': 'ID de transaction requis'}), 400
        
    # Get latest challenge to allow persistence
    challenge = Challenge.query.filter_by(user_id=user_id).order_by(Challenge.created_at.desc()).first()
    if not challenge:
        return jsonify({'error': 'Aucun challenge trouvé'}), 404

    # Find the specific open trade
    trade_to_close = Trade.query.filter_by(id=trade_id, challenge_id=challenge.id, is_open=True).first()
    if not trade_to_close:
        return jsonify({'error': 'Position non trouvée ou déjà fermée'}), 404
        
    current_price = price
    if not current_price:
        price_data = MarketDataService.get_realtime_price(trade_to_close.symbol)
        if not price_data:
            return jsonify({'error': 'Impossible de récupérer le prix actuel'}), 400
        current_price = price_data['price']
    
    # Profit/Loss Calculation for this specific order
    # Long: (Current - Entry) * Qty | Short: (Entry - Current) * Qty
    is_long = trade_to_close.action.lower() == 'buy'
    if is_long:
        pl = (current_price - trade_to_close.price) * trade_to_close.quantity
    else:
        pl = (trade_to_close.price - current_price) * trade_to_close.quantity
    
    # MT4 CAPITAL LOGIC: Update account balance ONLY on realized Profit/Loss
    challenge.current_equity += pl
    
    # Update trade record
    trade_to_close.is_open = False
    trade_to_close.close_price = current_price
    trade_to_close.profit_loss = pl
    
    db.session.commit()
    
    app = current_app._get_current_object()
    def verify_bg(cid):
        with app.app_context():
            from app.services.challenge_engine import ChallengeEngine
            ChallengeEngine.verify_challenge_rules(cid)
    import threading
    threading.Thread(target=verify_bg, args=(challenge.id,)).start()
    
    updated_portfolio = get_portfolio_internal(challenge.id)
    recent_trades = Trade.query.filter_by(challenge_id=challenge.id)\
        .order_by(Trade.timestamp.desc())\
        .limit(10)\
        .all()

    return jsonify({
        'message': f'Position {trade_to_close.symbol} fermée',
        'challenge': challenge.to_dict(),
        'positions': updated_portfolio['positions'],
        'recent_trades': [t.to_dict() for t in recent_trades],
        'status': 'success'
    }), 200


@bp.route('/close-all', methods=['POST'])
@jwt_required()
def close_all_positions():
    """Close all open positions at once"""
    try:
        user_id = int(get_jwt_identity())
        
        challenge = Challenge.query.filter_by(
            user_id=user_id
        ).order_by(Challenge.created_at.desc()).first()
        
        if not challenge:
            return jsonify({'error': 'No active challenge found'}), 404
        
        # Get all open positions
        portfolio_data = get_portfolio_internal(challenge.id)
        open_positions = portfolio_data['positions']
        
        if not open_positions:
            return jsonify({'message': 'No open positions to close'}), 200
        
        closed_count = 0
        total_pl = 0
        
        from app.services.market_data import MarketDataService
        
        for position in open_positions:
            trade = Trade.query.get(position['id'])
            if trade and trade.is_open:
                # Fetch Real-Time Price
                price_data = MarketDataService.get_realtime_price(trade.symbol)
                current_price = price_data['price'] if price_data else trade.price
                
                # Calculate P/L
                if trade.action == 'buy' or trade.action == 'ACHAT':
                    pl = (current_price - trade.price) * trade.quantity
                else: # Sell
                    pl = (trade.price - current_price) * trade.quantity
                
                # Close Trade
                trade.is_open = False
                trade.close_price = current_price
                trade.profit_loss = pl
                
                total_pl += pl
                closed_count += 1
        
        # Update challenge equity
        challenge.current_equity += total_pl
        db.session.commit()
        
        # Verify challenge rules (Background)
        app = current_app._get_current_object()
        def verify_bg(cid):
            with app.app_context():
                from app.services.challenge_engine import ChallengeEngine
                ChallengeEngine.verify_challenge_rules(cid)
        import threading
        threading.Thread(target=verify_bg, args=(challenge.id,)).start()
        
        # Get updated portfolio
        updated_portfolio = get_portfolio_internal(challenge.id)
        recent_trades = Trade.query.filter_by(challenge_id=challenge.id)\
            .order_by(Trade.timestamp.desc())\
            .limit(10)\
            .all()
        
        return jsonify({
            'message': f'{closed_count} positions fermées',
            'total_pl': round(total_pl, 2),
            'challenge': challenge.to_dict(),
            'positions': updated_portfolio['positions'],
            'recent_trades': [t.to_dict() for t in recent_trades],
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"ERROR in close_all: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to close positions: {str(e)}'}), 500


def get_portfolio_internal(challenge_id):
    """
    Get all independent open orders for MT4-style management.
    """
    open_trades = Trade.query.filter_by(challenge_id=challenge_id, is_open=True).order_by(Trade.timestamp.desc()).all()
    
    positions = []
    for t in open_trades:
        positions.append({
            'id': t.id,
            'symbol': t.symbol,
            'action': t.action,
            'quantity': round(t.quantity, 6),
            'price': round(t.price, 4),
            'timestamp': t.timestamp.isoformat() if t.timestamp else None
        })
            
    return {'positions': positions}


@bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's trading history"""
    user_id = int(get_jwt_identity())
    
    # Get latest challenge to allow persistence
    challenge = Challenge.query.filter_by(
        user_id=user_id
    ).order_by(Challenge.created_at.desc()).first()
    
    if not challenge:
        return jsonify({'error': 'No active challenge found'}), 404
    
    # Get all trades
    query = Trade.query.filter_by(challenge_id=challenge.id)
    
    # Filter by tag if provided
    tag_filter = request.args.get('tag')
    if tag_filter:
        # Simple string matching for comma-separated tags
        query = query.filter(Trade.tags.contains(tag_filter))
        
    trades = query.order_by(Trade.timestamp.desc()).all()
    
    return jsonify({
        'challenge_id': challenge.id,
        'total_trades': len(trades),
        'trades': [t.to_dict() for t in trades]
    }), 200


@bp.route('/performance-analysis', methods=['POST'])
@jwt_required()
def get_performance_analysis():
    """Get AI-powered performance analysis"""
    user_id = int(get_jwt_identity())
    print(f"DEBUG: Performance analysis requested for user {user_id}")
    
    challenge = Challenge.query.filter_by(
        user_id=user_id
    ).order_by(Challenge.created_at.desc()).first()
    
    if not challenge:
        print(f"DEBUG: No challenge found for user {user_id}")
        return jsonify({'error': 'No active challenge found'}), 404
    
    trades = Trade.query.filter_by(challenge_id=challenge.id).all()
    print(f"DEBUG: Analyzing {len(trades)} trades for challenge {challenge.id}")
    
    try:
        analysis = AIService.generate_trade_analysis(
            [t.to_dict() for t in trades],
            challenge.current_equity,
            challenge.initial_balance
        )
        print("DEBUG: Analysis generated successfully")
        return jsonify(analysis), 200
    except Exception as e:
        print(f"DEBUG: ERROR in performance analysis route: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/trades/<int:trade_id>/journal', methods=['PUT'])
@jwt_required()
def update_trade_journal(trade_id):
    """Update journal entry (notes & tags) for a specific trade"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Verify trade belongs to user's challenge
    trade = Trade.query.join(Challenge).filter(
        Trade.id == trade_id,
        Challenge.user_id == user_id
    ).first()
    
    if not trade:
        return jsonify({'error': 'Trade not found or access denied'}), 404
    
    # Update fields
    if 'notes' in data:
        trade.notes = data['notes']
        
    if 'tags' in data:
        # Ensure tags are stored as comma-separated string
        tags = data['tags']
        if isinstance(tags, list):
            trade.tags = ','.join(tags)
        else:
            trade.tags = tags
            
    if 'screenshot_url' in data:
        trade.screenshot_url = data['screenshot_url']
        
    db.session.commit()
    
    return jsonify({
        'message': 'Journal updated successfully',
        'trade': trade.to_dict()
    }), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_trading_stats():
    """Get detailed trading statistics for the active challenge"""
    try:
        user_id = int(get_jwt_identity())
        challenge = Challenge.query.filter_by(
            user_id=user_id
        ).order_by(Challenge.created_at.desc()).first()
        
        if not challenge:
            return jsonify({'error': 'No active challenge found'}), 404
            
        trades = Trade.query.filter_by(challenge_id=challenge.id).order_by(Trade.timestamp.asc()).all()
        
        if not trades:
            return jsonify({
                'total_trades': 0, 'win_rate': 0, 'profit_factor': 0,
                'avg_win': 0, 'avg_loss': 0, 'net_profit': 0,
                'equity_curve': [], 'daily_pl': []
            }), 200
            
        # Calculate stats
        wins = [t for t in trades if t.profit_loss > 0]
        losses = [t for t in trades if t.profit_loss <= 0]
        
        total_trades = len(trades)
        win_rate = (len(wins) / total_trades * 100) if total_trades > 0 else 0
        
        gross_profit = sum(t.profit_loss for t in wins)
        gross_loss = abs(sum(t.profit_loss for t in losses))
        
        profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else (gross_profit if gross_profit > 0 else 0)
        
        # Equity Curve & Daily P/L
        equity_curve = []
        # Start with initial balance point
        running_balance = challenge.initial_balance
        equity_curve.append({'time': int(challenge.created_at.timestamp()), 'value': running_balance})
        
        daily_pl = {}
        
        for t in trades:
            running_balance += t.profit_loss
            
            # Equity Curve Point
            equity_curve.append({
                'time': int(t.timestamp.timestamp()),
                'value': running_balance
            })
            
            # Daily P/L aggregation
            day_str = t.timestamp.strftime('%Y-%m-%d')
            daily_pl[day_str] = daily_pl.get(day_str, 0) + t.profit_loss
            
        # Format Daily P/L for charts
        daily_pl_list = [{'time': k, 'value': v} for k, v in daily_pl.items()]
        daily_pl_list.sort(key=lambda x: x['time'])
        
        return jsonify({
            'total_trades': total_trades,
            'win_rate': round(win_rate, 2),
            'profit_factor': profit_factor,
            'avg_win': round(gross_profit / len(wins), 2) if wins else 0,
            'avg_loss': round(gross_loss / len(losses), 2) if losses else 0,
            'net_profit': round(gross_profit - gross_loss, 2),
            'equity_curve': equity_curve,
            'daily_pl': daily_pl_list
        }), 200
    except Exception as e:
        print(f"ERROR in stats endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to calculate statistics', 'details': str(e)}), 500
