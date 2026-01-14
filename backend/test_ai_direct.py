import os
import sys
import json

# Mock Flask app context if needed
from flask import Flask

app = Flask(__name__)
app.config['GOOGLE_API_KEY'] = 'AIzaSyC1xgtrUiEymgv06z3QPn2RePGE9iQ1rR8'

with app.app_context():
    sys.path.append(os.getcwd())
    from app.services.ai_service import AIService
    
    trade_history = [
        {'id': 1, 'symbol': 'BTC-USD', 'action': 'buy', 'quantity': 1, 'price': 40000, 'profit_loss': 100, 'timestamp': '2026-01-13T12:00:00'},
        {'id': 2, 'symbol': 'BTC-USD', 'action': 'sell', 'quantity': 1, 'price': 41000, 'profit_loss': -50, 'timestamp': '2026-01-13T12:10:00'}
    ]
    
    print("Testing AIService.generate_trade_analysis...")
    try:
        result = AIService.generate_trade_analysis(trade_history, 5050, 5000)
        print("Result:")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"FAILED ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
