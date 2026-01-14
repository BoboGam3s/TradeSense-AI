from app import create_app
from flask_jwt_extended import create_access_token
import json

app = create_app()
with app.app_context():
    # Generate token for User 25
    token = create_access_token(identity='25')
    print(f"Generated Token: {token}")

    # Use test client
    client = app.test_client()
    headers = {'Authorization': f'Bearer {token}'}
    
    response = client.get('/api/trading/portfolio', headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    try:
        data = response.get_json()
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        print(f"Raw data: {response.data}")
