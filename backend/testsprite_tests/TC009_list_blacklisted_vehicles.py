import requests

BASE_URL = "http://127.0.0.1:5001"
USERNAME = "testUser"
PASSWORD = "testPassword123"
TIMEOUT = 30


def test_list_blacklisted_vehicles():
    try:
        # Login to get JWT token
        login_url = f"{BASE_URL}/api/auth/signin"
        login_payload = {
            "identifier": USERNAME,
            "password": PASSWORD
        }
        login_headers = {
            "Content-Type": "application/json"
        }

        login_resp = requests.post(login_url, json=login_payload, headers=login_headers, timeout=TIMEOUT, verify=False)
        assert login_resp.status_code == 200, f"Login failed with status code {login_resp.status_code}"
        login_data = login_resp.json()
        assert "accessToken" in login_data or "token" in login_data, "No token found in login response"

        token = login_data.get("accessToken") or login_data.get("token")
        auth_headers = {
            "Authorization": f"Bearer {token}"
        }

        # GET /api/blacklist to list blacklisted vehicles
        blacklist_url = f"{BASE_URL}/api/blacklist"
        resp = requests.get(blacklist_url, headers=auth_headers, timeout=TIMEOUT, verify=False)
        assert resp.status_code == 200, f"Expected 200 OK but got {resp.status_code}"

        resp_json = resp.json()
        # response should be a list (array) of blacklisted vehicles with fields vehicle_no and reason
        assert isinstance(resp_json, list), "Response is not a list"

        for item in resp_json:
            assert isinstance(item, dict), "Blacklist item is not an object"
            assert "vehicle_no" in item, "Blacklist item missing 'vehicle_no'"
            assert "reason" in item, "Blacklist item missing 'reason'"
            assert isinstance(item["vehicle_no"], str), "'vehicle_no' is not a string"
            assert isinstance(item["reason"], str), "'reason' is not a string"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_list_blacklisted_vehicles()