import requests

BASE_URL = "http://127.0.0.1:5001"
LOGIN_URL = f"{BASE_URL}/api/auth/signin"
TODAY_LOGS_URL = f"{BASE_URL}/api/entry/today"
TIMEOUT = 30

def test_get_todays_vehicle_entry_logs():
    # Authenticate user to get JWT token
    login_payload = {"identifier": "testUser", "password": "testPassword123"}
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("accessToken") or login_data.get("token") or login_data.get("jwt")
        assert token, "Token not found in login response"
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Request today's vehicle entry logs
    try:
        resp = requests.get(TODAY_LOGS_URL, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to get today's logs: {resp.text}"
        logs = resp.json()
        assert isinstance(logs, list), "Response is not a list"
        # Additional checks: each log should have date of entry matching today (basic check)
        # Since no exact format given, just check some keys existence
        for log in logs:
            assert isinstance(log, dict), "Log entry is not a dict"
            # Check keys likely present per PRD (vehicle_reg, driver_name, purpose)
            assert "vehicle_reg" in log, "vehicle_reg missing in log entry"
            assert "driver_name" in log, "driver_name missing in log entry"
            assert "purpose" in log, "purpose missing in log entry"
    except requests.RequestException as e:
        assert False, f"Request to today's entry logs failed: {e}"

test_get_todays_vehicle_entry_logs()