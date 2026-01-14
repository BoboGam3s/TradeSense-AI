import requests
import json

def test_register():
    url = "http://localhost:5000/api/auth/register"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "email": "test_debug@example.com",
        "password": "password123",
        "full_name": "Test User Debug",
        "language": "fr"
    }
    
    try:
        print(f"Sending POST request to {url}...")
        response = requests.post(url, headers=headers, json=data)
        
        print(f"Status Code: {response.status_code}")
        try:
            print("Response JSON:", response.json())
        except:
            print("Response is not JSON. Saving to error.html...")
            with open("error.html", "w", encoding="utf-8") as f:
                f.write(response.text)
            print("Error HTML saved.")
            
            # Simple fallback extraction
            if "OperationalError" in response.text:
                print("FOUND: OperationalError")
            if "IntegrityError" in response.text:
                print("FOUND: IntegrityError")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
