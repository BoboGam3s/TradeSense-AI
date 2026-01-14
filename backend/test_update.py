import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_update():
    # 1. Register a new user
    email = f"user_{int(time.time())}@example.com"
    password = "password123"
    
    print(f"Registering {email}...")
    resp = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test User"
    })
    
    if resp.status_code != 201:
        print("Registration failed:", resp.text)
        return

    token = resp.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Update profile
    print("Updating profile...")
    update_data = {
        "full_name": "Updated Name",
        "phone": "0612345678",
        "bio": "My new bio",
        "language": "en"
    }
    
    try:
        resp = requests.put(f"{BASE_URL}/auth/me", json=update_data, headers=headers)
        print(f"Update Status: {resp.status_code}")
        
        if resp.status_code == 200:
            print("Update Success:", resp.json())
        else:
            print("Update Failed.")
            # Save HTML to file if error
            with open("update_error.html", "w", encoding="utf-8") as f:
                f.write(resp.text)
            print("Error saved to update_error.html")
            
            # Print snippet
            if "<h1>" in resp.text:
                start = resp.text.find("<h1>") + 4
                end = resp.text.find("</h1>", start)
                print("Exception:", resp.text[start:end])
                
    except Exception as e:
        print("Exception during request:", e)

import time
if __name__ == "__main__":
    test_update()
