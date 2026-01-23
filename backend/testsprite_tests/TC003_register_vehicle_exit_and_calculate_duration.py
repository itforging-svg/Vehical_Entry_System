import requests
import datetime
import time

BASE_URL = "http://127.0.0.1:5001"
LOGIN_URL = f"{BASE_URL}/api/auth/signin"
ENTRY_URL = f"{BASE_URL}/api/entry/"

USERNAME = "testUser"
PASSWORD = "testPassword123"
TIMEOUT = 30


def test_register_vehicle_exit_and_calculate_duration():
    # Authenticate and get token
    try:
        login_resp = requests.post(
            LOGIN_URL,
            json={"username": USERNAME, "password": PASSWORD},
            timeout=TIMEOUT,
            verify=False,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json().get("accessToken") or login_resp.json().get("token")
        assert token, "No JWT token returned on login"
    except Exception as e:
        assert False, f"Authentication failed due to exception: {e}"

    headers = {"Authorization": f"Bearer {token}"}

    # Create a new vehicle entry to get an ID
    entry_payload = {
        "plant": "TestPlant",
        "vehicle_reg": "TEST1234",
        "driver_name": "Test Driver",
        "license_no": "LIC123456",
        "vehicle_type": "Car",
        "puc_validity": (datetime.date.today() + datetime.timedelta(days=365)).isoformat(),
        "insurance_validity": (datetime.date.today() + datetime.timedelta(days=365)).isoformat(),
        "chassis_last_5": "ABCDE",
        "engine_last_5": "12345",
        "purpose": "Testing exit timestamp",
        "material_details": "None",
        "transporter": "TestTransport",
        "aadhar_no": "123456789012",
        "driver_mobile": "9999999999",
        "challan_no": "CHL123",
        "security_person_name": "Security Guard 1",
        "photos": []
    }

    entry_id = None
    try:
        create_resp = requests.post(
            ENTRY_URL,
            json=entry_payload,
            headers=headers,
            timeout=TIMEOUT,
            verify=False,
        )
        assert create_resp.status_code == 201, f"Entry creation failed: {create_resp.text}"
        created_entry = create_resp.json()
        # The created entry ID might be returned in different formats, try common property names
        entry_id = created_entry.get("id") or created_entry.get("entry_id") or created_entry.get("data", {}).get("id")
        if not entry_id:
            # fallback: try to get first int field in response
            for v in created_entry.values():
                if isinstance(v, int):
                    entry_id = v
                    break
        assert entry_id is not None, "Created entry ID not returned"

        # Wait a short time to create a measurable duration difference
        time.sleep(2)

        # Register vehicle exit using PUT on /api/entry/{id}/exit
        exit_resp = requests.put(
            f"{ENTRY_URL}{entry_id}/exit",
            headers=headers,
            timeout=TIMEOUT,
            verify=False,
        )
        assert exit_resp.status_code == 200, f"Exit registration failed: {exit_resp.text}"
        exit_data = exit_resp.json()

        # Validate exit timestamp and duration fields
        # Duration might be under 'duration' or 'total_duration', consider nested 'data' field
        possible_duration_keys = ['duration', 'total_duration']
        exit_timestamp = exit_data.get("exit_time") or exit_data.get("exitDateTime") or exit_data.get("data", {}).get("exit_time")
        duration = None
        for key in possible_duration_keys:
            duration = exit_data.get(key) or exit_data.get("data", {}).get(key)
            if duration is not None:
                break

        assert exit_timestamp, "Exit timestamp (exit_time) not found in response"

        # parse exit timestamp ISO8601 string if possible
        try:
            exit_dt = datetime.datetime.fromisoformat(exit_timestamp.replace("Z", "+00:00"))
        except Exception:
            exit_dt = None
        assert exit_dt is not None, "Exit timestamp is not a valid ISO datetime"

        # Check duration is positive number or valid string indicating duration
        assert duration is not None, "Duration not found in response"
        if isinstance(duration, (int, float)):
            assert duration > 0, "Duration must be positive"
        elif isinstance(duration, str):
            assert len(duration) > 0, "Duration string must not be empty"
        else:
            assert False, f"Duration has unexpected type: {type(duration)}"

    finally:
        # Cleanup: delete the created entry if ID exists
        if entry_id is not None:
            try:
                requests.delete(f"{ENTRY_URL}{entry_id}", headers=headers, timeout=TIMEOUT, verify=False)
            except Exception:
                pass  # best effort cleanup


test_register_vehicle_exit_and_calculate_duration()
