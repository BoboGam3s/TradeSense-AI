"""
TradeSense AI - Market Data Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.market_data import MarketDataService
from app.services.ai_service import AIService

bp = Blueprint('market', __name__)


@bp.route('/symbols', methods=['GET'])
def get_available_symbols():
    """Get list of available trading symbols"""
    symbols = {
        'us_stocks': MarketDataService.US_CRYPTO_SYMBOLS[:4],  # AAPL, TSLA, GOOGL, MSFT
        'crypto': ['BTC-USD', 'ETH-USD'],
        'morocco': list(MarketDataService.MOROCCO_SYMBOLS.keys())
    }
    
    return jsonify(symbols), 200


@bp.route('/price/<symbol>', methods=['GET'])
@jwt_required()
def get_price(symbol):
    """Get real-time price for a symbol"""
    try:
        data = MarketDataService.get_realtime_price(symbol)
        status = MarketDataService.get_market_status(symbol)
        data.update(status)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/prices/batch', methods=['POST'])
@jwt_required()
def get_batch_prices():
    """Get prices for multiple symbols at once"""
    data = request.get_json()
    symbols = data.get('symbols', [])
    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400
    
    try:
        prices = MarketDataService.get_batch_prices(symbols)
        return jsonify(prices), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/historical/<symbol>', methods=['GET'])
@jwt_required()
def get_historical(symbol):
    """Get historical data for charting"""
    period = request.args.get('period', '1mo')
    interval = request.args.get('interval', '1d')
    
    try:
        data = MarketDataService.get_historical_data(symbol, period, interval)
        return jsonify({'symbol': symbol, 'period': period, 'interval': interval, 'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/ai-signal/<symbol>', methods=['GET'])
@jwt_required()
def get_ai_signal(symbol):
    """Get AI trading signal for a symbol"""
    try:
        # Get current price
        price_data = MarketDataService.get_realtime_price(symbol)
        
        if 'error' in price_data:
            return jsonify({'error': 'Could not fetch price data'}), 400
        
        # Generate AI signal
        signal = AIService.generate_trading_signal(symbol, price_data['price'])
        
        return jsonify(signal), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/market-summary', methods=['GET'])
@jwt_required()
def get_market_summary():
    """Get AI-generated market summary"""
    try:
        summary = AIService.generate_market_summary()
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/news', methods=['GET'])
@jwt_required()
def get_news():
    """Get market news"""
    try:
        news = MarketDataService.get_market_news()
        return jsonify({'news': news}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
