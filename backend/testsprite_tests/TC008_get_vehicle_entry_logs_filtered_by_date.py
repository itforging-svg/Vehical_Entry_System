import requests
from datetime import datetime
import json

BASE_URL = "http://127.0.0.1:5001"
TIMEOUT = 30
USERNAME = "testUser"
PASSWORD = "testPassword123"

def test_get_vehicle_entry_logs_filtered_by_date():
    session = requests.Session()
    session.verify = False  # Ignore HTTPS issues as per instruction
    try:
        # Authenticate and get JWT token
        auth_resp = session.post(
            f"{BASE_URL}/api/auth/signin",
            json={"username": USERNAME, "password": PASSWORD},
            timeout=TIMEOUT
        )
        assert auth_resp.status_code == 200, f"Auth failed: {auth_resp.text}"
        token = auth_resp.json().get("accessToken") or auth_resp.json().get("token")
        assert token, "Token not found in auth response"
        headers = {"Authorization": f"Bearer {token}"}

        # Prepare a vehicle entry log to ensure some data exists for the date filter
        today_date = datetime.utcnow().strftime("%Y-%m-%d")
        entry_payload = {
            "plant": "PlantA",
            "vehicle_reg": "UNBLOCKED-1234",
            "driver_name": "Test Driver",
            "license_no": "LIC1234567",
            "vehicle_type": "Truck",
            "puc_validity": today_date,
            "insurance_validity": today_date,
            "chassis_last_5": "ABCDE",
            "engine_last_5": "12345",
            "purpose": "Delivery",
            "material_details": "Materials for testing",
            "transporter": "Test Transporter",
            "aadhar_no": "123456789012",
            "driver_mobile": "9999999999",
            "challan_no": "CH123456",
            "security_person_name": "SecPerson",
            "photos": []
        }
        create_resp = session.post(
            f"{BASE_URL}/api/entry/",
            json=entry_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Create entry log failed: {create_resp.text}"
        created_entry = create_resp.json()
        entry_id = created_entry.get("id")
        assert entry_id is not None, "Created entry ID missing"

        # Call /api/entry/bydate with date query parameter
        params = {"date": today_date}
        get_resp = session.get(
            f"{BASE_URL}/api/entry/bydate",
            headers=headers,
            params=params,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Get bydate logs failed: {get_resp.text}"
        logs = get_resp.json()
        assert isinstance(logs, list), "Response is not a list"
        # Verify that all returned logs have createdAt field and match the filter date
        for log in logs:
            assert "createdAt" in log, "Log entry does not contain 'createdAt' field"
            log_date_str = log["createdAt"][:10] if isinstance(log["createdAt"], str) else None
            assert log_date_str == today_date, f"Log entry does not match filter date {today_date}: {json.dumps(log)}"

    finally:
        # Cleanup - delete the created vehicle entry log if API for deletion existed
        # It's not documented in PRD, so skip deletion to avoid failures
        pass

test_get_vehicle_entry_logs_filtered_by_date()