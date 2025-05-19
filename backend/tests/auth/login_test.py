import requests
import json
from config import BASE_URL

user_data = {
    "login": "username3",
    "password": "sec$3Ure_hash",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmVjNmFjZTYtMTUyNS00ZGMyLWFiYjctYTkxNmRhMGFmM2Q1IiwiZXhwIjoxNzQyMTU3NTUyfQ.iWik3josau1QOEHo_u7nGsyaku05d2tJQ0FUCoB2zR0",
    # "created_at": datetime.now()  # if you want to override the default. otherwise it will be set by the db.
}

response = requests.post(
    url=f"{BASE_URL}/auth/login",
    data=json.dumps(user_data),
    headers={"Content-Type": "application/json"}
)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
