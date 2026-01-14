import sys
import os
from datetime import datetime

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.services.market_data import MarketDataService

app = create_app()

def verify():
    with app.app_context():
        print(f"Current Date/Time: {datetime.now()}")
        
        symbols = ['GC=F', 'XAUUSD=X', 'AAPL', 'BTC-USD', 'IAM.CS']
        
        print("\n--- Verifying Batch Prices ---")
        batch_prices = MarketDataService.get_batch_prices(symbols)
        
        for symbol in symbols:
            data = batch_prices.get(symbol)
            if data:
                print(f"Symbol: {symbol}")
                print(f"  Price: {data.get('price')}")
                print(f"  Is Open: {data.get('is_open')}")
                print(f"  Status: {data.get('status')}")
                
                # Assertions
                if symbol == 'GC=F':
                    assert data.get('price') > 4500, f"Gold price {data.get('price')} is too low!"
                    assert data.get('is_open') is True, "Gold should be open on Wednesday 16:22 UTC"
                
                if symbol == 'AAPL':
                    assert data.get('price') > 200, f"Apple price {data.get('price')} is too low!"
                
                if symbol == 'BTC-USD':
                    assert data.get('price') > 80000, f"BTC price {data.get('price')} is too low!"
                    assert data.get('is_open') is True, "Crypto should always be open"
            else:
                print(f"Symbol: {symbol} - NO DATA")

        print("\nVerification successful!")

if __name__ == "__main__":
    verify()
