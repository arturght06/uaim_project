import requests
import json
from config import BASE_URL

user_data = {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0Mzk5MDkzMywidXNlcl9pZCI6ImJlYzZhY2U2LTE1MjUtNGRjMi1hYmI3LWE5MTZkYTBhZjNkNSIsImp0aSI6ImFjNzkxNjJjLWQ1NTEtNDRiYy1hMTU4LTY0MjA5MDkyNjE0OCJ9.RLFlkugaxwPRiMlNxSME5l8hHHmwB5HG8TlerDPpvYs"
}

response = requests.post(
    url=f"{BASE_URL}/auth/refresh",
    data=json.dumps(user_data),
    headers={"Content-Type": "application/json"}
)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
