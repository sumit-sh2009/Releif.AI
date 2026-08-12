import requests
import json
import time

API_URL = "http://localhost:8000/analyze"

payload = {
    "message": "Water levels are rising rapidly. Please help, I am in a wheelchair and have two dogs.",
    "location": "Mumbai, India",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "casualties": {
        "dead": 15,
        "injured": 250,
        "missing": 40,
        "affected_people": 5000
    }
}

print(f"Sending test request to {API_URL}...")
print(f"Location: {payload['location']}")
print(f"Message: {payload['message']}\n")

start_time = time.time()

try:
    response = requests.post(API_URL, json=payload, timeout=30)
    response.raise_for_status()
    
    elapsed = time.time() - start_time
    data = response.json()
    
    print(f"✅ Success! Received response in {elapsed:.2f} seconds.\n")
    print("=== FINAL AI ANALYSIS ===")
    print(json.dumps(data, indent=2))
    
except requests.exceptions.ConnectionError:
    print("❌ Error: Could not connect to the API.")
    print("Make sure the FastAPI server is running: python api_server.py")
except requests.exceptions.HTTPError as e:
    print(f"❌ API Error: {e}")
    print(response.text)
except Exception as e:
    print(f"❌ Unexpected Error: {e}")
