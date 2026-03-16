import requests

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
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
