import requests
import json
from config import BASE_URL

user_id = "7978c776-9cb2-4d93-b1fb-36ddc6fab36d"

response = requests.get(
    url=f"{BASE_URL}/users/{user_id}",
    headers={"Content-Type": "application/json", "Authorization": "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQzOTU4MDI1LCJ1c2VyX2lkIjoiNzk3OGM3NzYtOWNiMi00ZDkzLWIxZmItMzZkZGM2ZmFiMzZkIn0.6ZxFcieK847iz_fjlemzsEeULFCNM4Y4ph5u_Vm55Gw"}
)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
