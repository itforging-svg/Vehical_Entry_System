import requests
import datetime

BASE_URL = "http://127.0.0.1:5001"
LOGIN_URL = f"{BASE_URL}/api/auth/signin"
ENTRY_URL = f"{BASE_URL}/api/entry/"
TIMEOUT = 30


def test_create_vehicle_entry_log_with_complete_details():
    # Login to get JWT token
    login_payload = {
        "username": "testUser",
        "password": "testPassword123"
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"
    assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
    login_json = login_resp.json()
    token = login_json.get("accessToken") or login_json.get("token")
    assert token, "Login response did not contain access token"

    headers = {"Authorization": f"Bearer {token}"}

    # Prepare complete vehicle entry log data
    today_str = datetime.date.today().isoformat()
    vehicle_entry_data = {
        "plant": "Plant A",
        "vehicle_reg": "AB123CD",
        "driver_name": "John Doe",
        "license_no": "DL1234567890",
        "vehicle_type": "Truck",
        "puc_validity": today_str,
        "insurance_validity": today_str,
        "chassis_last_5": "ABCDE",
        "engine_last_5": "12345",
        "purpose": "Delivery",
        "material_details": "Electronic goods",
        "transporter": "XYZ Transports",
        "aadhar_no": "123412341234",
        "driver_mobile": "9876543210",
        "challan_no": "CH123456",
        "security_person_name": "Security Guard 1",
        "photos": ["base64stringphoto1", "base64stringphoto2"]
    }

    entry_id = None
    try:
        # Create vehicle entry log
        try:
            response = requests.post(ENTRY_URL, json=vehicle_entry_data, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Create vehicle entry request failed: {e}"

        assert response.status_code == 201, f"Expected 201 Created but got {response.status_code}"
        resp_json = response.json()
        # Assuming the response contains an 'id' field for the created entry
        entry_id = resp_json.get("id")
        assert entry_id is not None, "Response JSON does not contain entry log id"

        # Validate that the returned data matches input where applicable
        for key in vehicle_entry_data:
            # photos might be stored differently so we skip deep check on photos
            if key == "photos":
                continue
            assert key in resp_json, f"Response missing field: {key}"
            # For date fields, check if valid date string but do not assert exact equality due to server timezone handling
            if key in ["puc_validity", "insurance_validity"]:
                try:
                    datetime.date.fromisoformat(resp_json[key][:10])
                except Exception:
                    assert False, f"Response {key} is not a valid date string: {resp_json[key]}"
            else:
                assert resp_json[key] == vehicle_entry_data[key], f"Mismatch for field {key}: expected '{vehicle_entry_data[key]}', got '{resp_json[key]}'"

        # Validate that entry timestamp is recorded and is a valid ISO datetime string
        entry_timestamp = resp_json.get("entry_timestamp") or resp_json.get("createdAt") or resp_json.get("timestamp")
        assert entry_timestamp is not None, "Entry timestamp not found in response"

        # Check if entry_timestamp is a valid ISO format datetime string
        try:
            datetime.datetime.fromisoformat(entry_timestamp.replace("Z", "+00:00"))
        except Exception:
            assert False, f"Entry timestamp is not a valid ISO 8601 datetime: {entry_timestamp}"

    finally:
        # Cleanup: delete the created entry log if possible to keep test idempotent
        if entry_id:
            delete_url = f"{ENTRY_URL}{entry_id}"
            try:
                requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
            except Exception:
                pass


test_create_vehicle_entry_log_with_complete_details()
