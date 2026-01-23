import requests

BASE_URL = "http://127.0.0.1:5001"
IDENTIFIER = "testUser"
USERNAME = "testUser"
PASSWORD = "testPassword123"
TIMEOUT = 30

def test_retrieve_vehicle_entry_history_by_identifier():
    session = requests.Session()
    try:
        # Login to get JWT token
        login_url = f"{BASE_URL}/api/auth/signin"
        login_payload = {"username": USERNAME, "password": PASSWORD}
        login_response = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        token = login_response.json().get("accessToken") or login_response.json().get("token")
        assert token is not None, "No access token received on login"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Retrieve vehicle entry history by identifier
        history_url = f"{BASE_URL}/api/entry/history/{IDENTIFIER}"
        history_response = session.get(history_url, headers=headers, timeout=TIMEOUT)
        assert history_response.status_code == 200, f"History retrieval failed with status {history_response.status_code}"
        history_data = history_response.json()

        # The response should be a list or dict containing entry and exit logs
        assert isinstance(history_data, (list, dict)), "History response is not a list or dict"
        # If it is list, check if entries have the expected keys, else if dict check accordingly
        if isinstance(history_data, list):
            for entry in history_data:
                assert "vehicle_reg" in entry or "driver_name" in entry, "Expected key missing in history entry"
                assert "entry_time" in entry or "entry_timestamp" in entry or "check_in" in entry, "Entry time missing in history entry"
        elif isinstance(history_data, dict):
            # Check that dict contains keys indicating history logs
            keys = history_data.keys()
            assert any(k in keys for k in ["history", "entries", "logs"]), "Expected history keys not found in response"

    finally:
        session.close()

test_retrieve_vehicle_entry_history_by_identifier()