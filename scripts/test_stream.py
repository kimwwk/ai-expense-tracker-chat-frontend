import requests
import json
import sys

# Simple script to test the mock API endpoint
# Usage: python scripts/test_stream.py "update dashboard"

def test_chat_stream(message="Hello"):
    url = "http://localhost:3000/api/chat"
    payload = {
        "messages": [{"role": "user", "content": message}]
    }
    
    print(f"Sending message: '{message}'...")
    print("-" * 40)
    
    try:
        with requests.post(url, json=payload, stream=True) as response:
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                return

            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith('data: '):
                        data_str = decoded_line[6:]
                        try:
                            data = json.loads(data_str)
                            print(f"Received Event: {data['type']}")
                            if data['type'] == 'token':
                                print(f"  Content: {data['content']}")
                            elif data['type'] == 'tool_call':
                                print(f"  Tool: {data['tool']}")
                                print(f"  Params: {data['params']}")
                                if data.get('needsApproval'):
                                    print("  [REQUIRES APPROVAL]")
                        except json.JSONDecodeError:
                            print(f"Raw: {decoded_line}")
    except Exception as e:
        print(f"Connection error: {e}")
        print("Make sure the Next.js server is running on localhost:3000")

if __name__ == "__main__":
    msg = sys.argv[1] if len(sys.argv) > 1 else "Hello"
    test_chat_stream(msg)
