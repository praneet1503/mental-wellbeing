import urllib.request
import json
import ssl

URL = "https://praneetnrana--mw-api-web.modal.run/health"

def test_health():
    print(f"Testing Health Endpoint: {URL}")
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(URL, context=ctx) as response:
            result = json.loads(response.read().decode('utf-8'))
            print("\n--- Response ---")
            print(json.dumps(result, indent=2))
            
    except Exception as e:
        print(f"\nFailed: {e}")

if __name__ == "__main__":
    test_health()
