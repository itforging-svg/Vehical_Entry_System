import requests
import datetime

BASE_URL = "http://127.0.0.1:5001"
TIMEOUT = 30

def test_tc002_create_vehicle_entry_log_with_complete_details():
    signin_url = f"{BASE_URL}/api/auth/signin"
    entry_url = f"{BASE_URL}/api/entry/"
    
    # Authenticate to get JWT token
    auth_payload = {
        "username": "testUser",
        "password": "testPassword123"
    }
    try:
        auth_resp = requests.post(signin_url, json=auth_payload, timeout=TIMEOUT, verify=False)
        assert auth_resp.status_code == 200, f"Signin failed with status {auth_resp.status_code}"
        auth_data = auth_resp.json()
        token = auth_data.get("accessToken") or auth_data.get("token") or auth_data.get("jwt") or auth_data.get("access_token")
        assert token, "JWT token not found in signin response"
    except requests.RequestException as e:
        assert False, f"Signin request failed: {e}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Prepare the complete vehicle entry log data - all required and optional fields
    # Use realistic values, including dates in YYYY-MM-DD format
    entry_payload = {
        "plant": "Plant A",
        "vehicle_reg": "ABC1234",
        "driver_name": "John Doe",
        "license_no": "DL1234567890123",
        "vehicle_type": "Truck",
        "puc_validity": (datetime.date.today() + datetime.timedelta(days=365)).isoformat(),
        "insurance_validity": (datetime.date.today() + datetime.timedelta(days=180)).isoformat(),
        "chassis_last_5": "X1Y2Z",
        "engine_last_5": "E7F8G",
        "purpose": "Delivery of construction materials",
        "material_details": "Cement bags",
        "transporter": "XYZ Transporters",
        "aadhar_no": "123412341234",
        "driver_mobile": "9998887776",
        "challan_no": "CHL123456",
        "security_person_name": "Security Guard 1",
        "photos": [
            "base64encodedstring_photo1",
            "base64encodedstring_photo2"
        ]
    }

    created_entry_id = None
    try:
        resp = requests.post(entry_url, json=entry_payload, headers=headers, timeout=TIMEOUT, verify=False)
        assert resp.status_code == 201, f"Expected status 201 Created, got {resp.status_code}"
        resp_data = resp.json()
        # Check that ID or equivalent is returned for further use or verification
        created_entry_id = resp_data.get("id") or resp_data.get("entry_id") or resp_data.get("entryId")
        assert created_entry_id is not None, "Created entry ID not returned in response"

        # Validate that all returned fields match the input or are present
        for key in entry_payload:
            # photos might be returned differently or omitted, skip strict match on photos
            if key == "photos":
                continue
            assert key in resp_data, f"Response missing field '{key}'"
            # For date fields, compare only date portion allowing server to return previous day in some cases
            if key in ("puc_validity", "insurance_validity"):
                try:
                    expected_date = datetime.date.fromisoformat(entry_payload[key])
                    # Attempt to parse returned value as date or datetime
                    val_str = resp_data[key]
                    # Extract date part for comparison
                    if 'T' in val_str:
                        val_date = datetime.date.fromisoformat(val_str.split('T')[0])
                    else:
                        val_date = datetime.date.fromisoformat(val_str)
                except Exception:
                    assert False, f"Field '{key}' returned invalid date format: {resp_data[key]}"
                # Accept val_date equal to expected_date or one day less
                if not (val_date == expected_date or val_date == expected_date - datetime.timedelta(days=1)):
                    assert False, f"Mismatch in field '{key}': expected '{expected_date}' or one day before, got '{val_date}'"
            else:
                assert resp_data[key] == entry_payload[key], f"Mismatch in field '{key}': expected '{entry_payload[key]}', got '{resp_data[key]}'"
        
        # Check for entry timestamp presence and reasonable recentness
        entry_timestamp = resp_data.get("entry_timestamp") or resp_data.get("timestamp") or resp_data.get("entryTime")
        assert entry_timestamp, "Entry timestamp not found in response"
        # Validate timestamp format and recency (ISO 8601 and within last 5 min)
        try:
            ts = datetime.datetime.fromisoformat(entry_timestamp.replace("Z", "+00:00"))
        except Exception:
            assert False, "Entry timestamp is not a valid ISO 8601 datetime"
        now_utc = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc)
        delta = now_utc - ts
        assert abs(delta.total_seconds()) < 300, "Entry timestamp is not recent (within 5 minutes)"
    except requests.RequestException as e:
        assert False, f"Vehicle entry creation request failed: {e}"
    finally:
        # Cleanup: delete created entry if possible
        if created_entry_id is not None:
            try:
                delete_url = f"{entry_url}{created_entry_id}"
                delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT, verify=False)
                # Accept 200 or 204 as success for delete
                assert delete_resp.status_code in (200, 204), f"Failed to delete created entry, status {delete_resp.status_code}"
            except requests.RequestException:
                # Log but do not fail test on cleanup failure
                pass

test_tc002_create_vehicle_entry_log_with_complete_details()
