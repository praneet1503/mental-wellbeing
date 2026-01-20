import urllib.request
import json
import os
import sys
import ssl

URL = "https://praneetnrana--mw-api-web.modal.run/v1/chat"
API_KEY = "mw-secure-123"  # Default MVP key

def test_chat():
    print(f"Testing Chat Endpoint: {URL}")
    
    payload = {
        "message": "I've been feeling really overwhelmed lately.",
        "user_id": "test_user_01"
    }
    
    data = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(URL, data=data)
    req.add_header('Content-Type', 'application/json')
    req.add_header('X-API-KEY', API_KEY)
    
    # Bypass SSL for local dev environment issues
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode('utf-8'))
            print("\n--- Response ---")
            print(json.dumps(result, indent=2))
            
    except urllib.error.HTTPError as e:
        print(f"\nError: {e.code} - {e.reason}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"\nFailed: {e}")

if __name__ == "__main__":
    test_chat()
