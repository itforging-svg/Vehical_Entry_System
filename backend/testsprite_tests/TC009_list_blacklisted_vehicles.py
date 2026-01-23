import requests

BASE_URL = "http://127.0.0.1:5001"
AUTH_URL = f"{BASE_URL}/api/auth/signin"
BLACKLIST_URL = f"{BASE_URL}/api/blacklist"
TIMEOUT = 30

TEST_USER = {"username": "testUser", "password": "testPassword123"}


def test_TC009_list_blacklisted_vehicles():
    # Authenticate and get token
    try:
        auth_resp = requests.post(
            AUTH_URL, json=TEST_USER, timeout=TIMEOUT, verify=False
        )
        assert auth_resp.status_code == 200, f"Auth failed: {auth_resp.text}"
        token = auth_resp.json().get("accessToken") or auth_resp.json().get("token")
        assert token, "JWT token not found in auth response"
    except requests.RequestException as e:
        assert False, f"Exception during authentication: {e}"

    headers = {"Authorization": f"Bearer {token}"}

    # Get blacklisted vehicles list
    try:
        resp = requests.get(BLACKLIST_URL, headers=headers, timeout=TIMEOUT, verify=False)
        assert resp.status_code == 200, f"Failed to get blacklist: {resp.text}"
        data = resp.json()
        assert isinstance(data, list), "Blacklist response is not a list"
        # Optional: validate each item has vehicle_no and reason keys
        for entry in data:
            assert "vehicle_no" in entry, "Missing vehicle_no in blacklist entry"
            assert "reason" in entry, "Missing reason in blacklist entry"
    except requests.RequestException as e:
        assert False, f"Exception during blacklist retrieval: {e}"


test_TC009_list_blacklisted_vehicles()