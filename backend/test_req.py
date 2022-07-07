import requests

acc_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiYWJoaWplZXRsb2toYW5kZTE5OTZAZ21haWwuY29tIiwiZXhwaXJlcyI6MTY1NzgyOTkyNi41OTgyMzh9.OfXwQ-0D-EfVojYWjUf6YNnPQSA4dfo52VNarPhrAnQ"
API_END_POINT = "http://127.0.0.1:8000/save_user_data"
headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {acc_token}"
}
payload = {
    "email": "abhijeetlokhande1996@gmail.com",
    "test": "123@abc"
}
r = requests.post(API_END_POINT, json=payload, headers=headers)
print(r)
