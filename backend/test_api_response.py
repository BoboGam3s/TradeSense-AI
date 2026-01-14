from app import create_app
from flask_jwt_extended import create_access_token
import json
import requests

app = create_app()
with app.app_context():
    # Generate token for User 25
    token = create_access_token(identity='25')
    print(f"Generated Token: {token}")

    # Call the API locally
    headers = {'Authorization': f'Bearer {token}'}
    try:
        response = requests.get('http://localhost:5000/api/trading/portfolio', headers=headers)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error calling API: {e}")
