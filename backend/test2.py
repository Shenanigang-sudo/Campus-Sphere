import requests
import json

url = "http://localhost:8000/auth/register/student"
data = {
  "name": "Test Student",
  "course": "BS CS",
  "academic_year_start": 2022,
  "academic_year_end": 2026,
  "username": "teststu123",
  "email": "teststu123@example.com",
  "password": "password123"
}
try:
    response = requests.post(url, json=data)
    with open("error_trace_python.txt", "w", encoding="utf-8") as f:
        f.write(f"Status: {response.status_code}\n")
        
        try:
            parsed = response.json()
            f.write(json.dumps(parsed, indent=4))
        except:
            f.write(response.text)
except Exception as e:
    with open("error_trace_python.txt", "w", encoding="utf-8") as f:
        f.write(f"Error: {e}")
