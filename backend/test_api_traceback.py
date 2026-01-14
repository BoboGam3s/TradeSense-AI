from app import create_app
from flask_jwt_extended import create_access_token
import json
import traceback

app = create_app()

@app.errorhandler(Exception)
def handle_exception(e):
    return {
        "error": str(e),
        "traceback": traceback.format_exc()
    }, 500

with app.app_context():
    # Generate token for User 25
    token = create_access_token(identity='25')
    print(f"Generated Token: {token}")

    # Use test client
    client = app.test_client()
    headers = {'Authorization': f'Bearer {token}'}
    
    response = client.get('/api/trading/portfolio', headers=headers)
    print(f"Status Code: {response.status_code}")
    
    data = response.get_json()
    if data and "traceback" in data:
        print("TRACEBACK:")
        print(data["traceback"])
    else:
        print("Data:", data)
