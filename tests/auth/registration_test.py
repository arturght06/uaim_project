import requests
import json
from config import BASE_URL

user_data = {
    "username": "username3",
    "name": "John",
    "surname": "Doe",
    "birthday": '1990-12-12',
    "email": "john.doe3@example.com",
    "phone_country_code": "+48",
    "phone_number": "697255913",
    "salt": "salt",
    "password": "sec$3Ure_hash",
    # "created_at": datetime.now()  # if you want to override the default. otherwise it will be set by the db.
}

response = requests.post(
    url=f"{BASE_URL}/auth/register",
    data=json.dumps(user_data),
    headers={"Content-Type": "application/json"}
)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
