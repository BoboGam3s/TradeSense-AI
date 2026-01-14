import sys
import os
from datetime import datetime

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.market_data import MarketDataService

def verify_logic():
    print(f"Verifying Logic at {datetime.utcnow()} UTC")
    
    # Check is_market_open for Gold
    is_open, msg = MarketDataService.is_market_open('GC=F')
    print(f"GC=F Market Open: {is_open} ({msg})")
    
    # Check fallback price for Gold - simulate fetch by overriding cache
    MarketDataService._price_cache.clear()
    # We can't easily skip yfinance without mocking, but we can check if it 
    # would use the right fallback if yfinance fails.
    
    # Let's mock the ticker to fail immediately
    import unittest.mock as mock
    with mock.patch('yfinance.Ticker') as mock_ticker:
        mock_ticker.return_value.history.return_value.empty = True
        
        price_data = MarketDataService.get_realtime_price('GC=F')
        print(f"GC=F Price Data: {price_data}")
        
        if price_data:
            price = price_data.get('price')
            print(f"Verified Gold Price: {price}")
            assert 4618 <= price <= 4625, f"Gold price {price} not in expected 2026 range!"
            
        # Check Apple
        apple_data = MarketDataService.get_realtime_price('AAPL')
        print(f"AAPL Price Data: {apple_data}")
        assert 350 <= apple_data.get('price') <= 352, f"Apple price {apple_data.get('price')} incorrect"

        # Check BTC
        btc_data = MarketDataService.get_realtime_price('BTC-USD')
        print(f"BTC Price Data: {btc_data}")
        assert 124000 < btc_data.get('price') < 126000, f"BTC price {btc_data.get('price')} incorrect"

    print("\n--- Verifying Batch Price logic ---")
    with mock.patch('yfinance.Ticker') as mock_ticker:
        mock_ticker.return_value.history.return_value.empty = True
        batch = MarketDataService.get_batch_prices(['GC=F', 'AAPL'])
        print(f"Batch keys: {list(batch.keys())}")
        for sym, data in batch.items():
            print(f"{sym}: is_open={data.get('is_open')}, price={data.get('price')}")
            assert 'is_open' in data, f"is_open missing for {sym}"

    print("\nAll logic checks PASSED!")

if __name__ == "__main__":
    verify_logic()
