import requests
from requests.exceptions import RequestException

BASE_URL = "http://127.0.0.1:5001"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
TODAY_LOGS_URL = f"{BASE_URL}/api/entry/today"

USERNAME = "testUser"
PASSWORD = "testPassword123"
TIMEOUT = 30

def test_get_todays_vehicle_entry_logs():
    try:
        # Authenticate and get JWT token
        signin_payload = {
            "username": USERNAME,
            "password": PASSWORD
        }
        signin_resp = requests.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
        assert signin_resp.status_code == 200, f"Signin failed with status {signin_resp.status_code}"
        signin_data = signin_resp.json()
        assert "accessToken" in signin_data or "token" in signin_data, "JWT token not found in signin response"
        token = signin_data.get("accessToken") or signin_data.get("token")
        assert token, "Token is empty"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Get today's vehicle entry logs
        today_resp = requests.get(TODAY_LOGS_URL, headers=headers, timeout=TIMEOUT)
        assert today_resp.status_code == 200, f"Failed to get today's logs, status {today_resp.status_code}"

        logs = today_resp.json()
        assert isinstance(logs, list), "Response is not a list"

        # Each log should have an entry timestamp from today (string date validation or presence)
        from datetime import datetime
        today_date = datetime.utcnow().date()

        # Check at least one log has today's date (if logs exist)
        if logs:
            for log in logs:
                # Possible keys for timestamps: check-in or entry timestamp?
                # According to schema, entry timestamp is automatic but not explicitly named
                # So check for keys that look like date strings in log
                # We attempt to find any date field in the log matching today
                date_fields = [k for k,v in log.items() if isinstance(v, str) and len(v) >= 10]
                found_today = False
                for field in date_fields:
                    try:
                        val_date = datetime.strptime(log[field][:10], "%Y-%m-%d").date()
                        if val_date == today_date:
                            found_today = True
                            break
                    except Exception:
                        continue
                assert found_today, "No date field found for today's date in at least one log"
        else:
            # If no logs, that is acceptable - no entries today
            pass

    except RequestException as e:
        assert False, f"Request failed: {e}"
    except AssertionError as e:
        assert False, f"Assertion failed: {e}"

test_get_todays_vehicle_entry_logs()