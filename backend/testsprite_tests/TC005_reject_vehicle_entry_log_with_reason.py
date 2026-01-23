import requests
import traceback

BASE_URL = "http://127.0.0.1:5001"
AUTH_URL = f"{BASE_URL}/api/auth/signin"
ENTRY_URL = f"{BASE_URL}/api/entry"

USERNAME = "testUser"
PASSWORD = "testPassword123"
TIMEOUT = 30

def authenticate():
    try:
        resp = requests.post(
            AUTH_URL,
            json={"username": USERNAME, "password": PASSWORD},
            timeout=TIMEOUT,
            verify=False
        )
        resp.raise_for_status()
        token = resp.json().get("accessToken") or resp.json().get("token")
        assert token, "No token found in authentication response"
        return token
    except Exception:
        raise

def create_vehicle_entry(token):
    payload = {
        "plant": "Test Plant",
        "vehicle_reg": "TEST1234",
        "driver_name": "John Doe",
        "license_no": "DL1234567",
        "vehicle_type": "Truck",
        "puc_validity": "2030-12-31",
        "insurance_validity": "2030-12-31",
        "chassis_last_5": "ABCDE",
        "engine_last_5": "XYZ12",
        "purpose": "Test delivery",
        "material_details": "Test materials",
        "transporter": "Test Transporter",
        "aadhar_no": "123412341234",
        "driver_mobile": "9876543210",
        "challan_no": "CH1234",
        "security_person_name": "Security Guy",
        "photos": []
    }
    headers = {
        "Authorization": f"Bearer {token}"
    }
    resp = requests.post(
        ENTRY_URL + "/",
        json=payload,
        headers=headers,
        timeout=TIMEOUT,
        verify=False
    )
    resp.raise_for_status()
    assert resp.status_code == 201
    json_resp = resp.json()
    entry_id = json_resp.get("id")
    assert entry_id is not None, "Created entry ID not found"
    return entry_id

def delete_vehicle_entry(token, entry_id):
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        resp = requests.delete(
            f"{ENTRY_URL}/{entry_id}",
            headers=headers,
            timeout=TIMEOUT,
            verify=False
        )
        # Delete may not be supported but attempt anyway; ignore errors
    except Exception:
        pass

def test_reject_vehicle_entry_log_with_reason():
    token = None
    entry_id = None
    try:
        token = authenticate()
        # Create entry if no ID provided
        entry_id = create_vehicle_entry(token)

        headers = {
            "Authorization": f"Bearer {token}"
        }
        reject_payload = {
            "reason": "Vehicle documents incomplete"
        }

        reject_resp = requests.put(
            f"{ENTRY_URL}/{entry_id}/reject",
            json=reject_payload,
            headers=headers,
            timeout=TIMEOUT,
            verify=False
        )
        reject_resp.raise_for_status()
        assert reject_resp.status_code == 200

        # Optionally verify the reason recorded by fetching the entry detail or history if supported
        # Since no endpoint for get by id is specified, skip verification beyond status code.

    except Exception as e:
        print("Test failed:", e)
        print(traceback.format_exc())
        assert False, f"Exception during test: {e}"
    finally:
        if token and entry_id:
            delete_vehicle_entry(token, entry_id)

test_reject_vehicle_entry_log_with_reason()