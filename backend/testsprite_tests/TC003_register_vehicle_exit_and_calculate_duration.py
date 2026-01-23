import requests
import datetime
import time

BASE_URL = "http://127.0.0.1:5001"
AUTH_ENDPOINT = f"{BASE_URL}/api/auth/signin"
ENTRY_ENDPOINT = f"{BASE_URL}/api/entry/"

TEST_USER = {
    "username": "testUser",
    "password": "testPassword123"
}

HEADERS = {
    "Content-Type": "application/json"
}

def authenticate():
    resp = requests.post(AUTH_ENDPOINT, json=TEST_USER, timeout=30, verify=False)
    assert resp.status_code == 200, f"Authentication failed with status code {resp.status_code}"
    data = resp.json()
    token = data.get("accessToken") or data.get("token") or data.get("jwt")
    assert token, "No token found in authentication response"
    return token

def create_vehicle_entry(token):
    now = datetime.datetime.utcnow().date().isoformat()
    payload = {
        "plant": "Main Plant",
        "vehicle_reg": f"TEST{int(time.time())}",
        "driver_name": "John Doe",
        "license_no": "DL123456789",
        "vehicle_type": "Truck",
        "puc_validity": now,
        "insurance_validity": now,
        "chassis_last_5": "ABCDE",
        "engine_last_5": "12345",
        "purpose": "Delivery",
        "material_details": "Paint Materials",
        "transporter": "XYZ Logistics",
        "aadhar_no": "111122223333",
        "driver_mobile": "9876543210",
        "challan_no": "CHL123456",
        "security_person_name": "Security Guard 1",
        "photos": []
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    resp = requests.post(ENTRY_ENDPOINT, json=payload, headers=headers, timeout=30, verify=False)
    assert resp.status_code == 201, f"Create entry failed with status code {resp.status_code}"
    created_entry = resp.json()
    entry_id = created_entry.get("id") or created_entry.get("entry_id") or created_entry.get("ID")
    assert entry_id is not None, "No entry ID returned on creation"
    return entry_id

def delete_vehicle_entry(token, entry_id):
    # The PRD does not specify a DELETE endpoint; skipping delete step.
    # If there's a way to delete, add here.
    pass

def get_entry_details(token, entry_id):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    resp = requests.get(f"{ENTRY_ENDPOINT}{entry_id}", headers=headers, timeout=30, verify=False)
    if resp.status_code == 200:
        return resp.json()
    return None

def test_register_vehicle_exit_and_calculate_duration():
    token = authenticate()
    headers = {
        "Authorization": f"Bearer {token}"
    }
    entry_id = None

    try:
        # Create a new vehicle entry
        entry_id = create_vehicle_entry(token)

        # Wait 2 seconds to simulate some duration elapsed
        time.sleep(2)

        # Register vehicle exit via PUT /api/entry/{id}/exit
        resp_exit = requests.put(f"{ENTRY_ENDPOINT}{entry_id}/exit", headers=headers, timeout=30, verify=False)
        assert resp_exit.status_code == 200, f"Vehicle exit update failed with status code {resp_exit.status_code}"
        exit_data = resp_exit.json()

        # Validate the response contains exit timestamp and duration
        exit_timestamp = exit_data.get("exit_timestamp") or exit_data.get("exitTime") or exit_data.get("exit_at") or exit_data.get("exit_time")
        duration = exit_data.get("duration") or exit_data.get("total_duration") or exit_data.get("stay_duration")

        assert exit_timestamp is not None, "Exit timestamp missing in response"
        assert duration is not None, "Duration missing in response"

        # Check that duration is positive and plausible (at least 2 seconds)
        if isinstance(duration, str):
            # Handle ISO 8601 duration or string durations if any; ignore detailed parse here, just check not empty
            assert len(duration) > 0, "Duration string is empty"
        else:
            assert float(duration) >= 2.0, f"Duration too short: {duration}"

        # Optionally, verify that exit timestamp is later than the entry timestamp
        entry_time = exit_data.get("entry_timestamp") or exit_data.get("entryTime") or exit_data.get("created_at")
        if entry_time:
            e_time = datetime.datetime.fromisoformat(entry_time.replace("Z", "+00:00")) if "T" in entry_time else None
            ex_time = datetime.datetime.fromisoformat(exit_timestamp.replace("Z", "+00:00")) if "T" in exit_timestamp else None
            if e_time and ex_time:
                assert ex_time > e_time, "Exit time is not after entry time"

    finally:
        # Clean up: no delete endpoint specified; if available implement here
        pass

test_register_vehicle_exit_and_calculate_duration()
