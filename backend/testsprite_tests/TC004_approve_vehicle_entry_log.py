import requests
import json

BASE_URL = "http://127.0.0.1:5001"
USERNAME = "testUser"
PASSWORD = "testPassword123"
TIMEOUT = 30


def test_approve_vehicle_entry_log():
    session = requests.Session()
    try:
        # Authenticate user to get JWT token
        auth_response = session.post(
            f"{BASE_URL}/api/auth/signin",
            json={"username": USERNAME, "password": PASSWORD},
            timeout=TIMEOUT,
            verify=False,
        )
        assert auth_response.status_code == 200, f"Login failed: {auth_response.text}"
        token = auth_response.json().get("accessToken")
        assert token, "No accessToken found in login response"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        # Create a new vehicle entry log since no ID provided
        new_entry_payload = {
            "plant": "Test Plant",
            "vehicle_reg": "TEST1234",
            "driver_name": "John Doe",
            "license_no": "L1234567",
            "vehicle_type": "Truck",
            "puc_validity": "2026-12-31",
            "insurance_validity": "2026-12-31",
            "chassis_last_5": "ABCDE",
            "engine_last_5": "12345",
            "purpose": "Delivery",
            "material_details": "Electronics",
            "transporter": "Test Transporters",
            "aadhar_no": "123412341234",
            "driver_mobile": "9876543210",
            "challan_no": "CH123456",
            "security_person_name": "Security Guard 1",
            "photos": []
        }
        create_resp = session.post(
            f"{BASE_URL}/api/entry/",
            json=new_entry_payload,
            headers=headers,
            timeout=TIMEOUT,
            verify=False,
        )
        assert create_resp.status_code == 201, f"Entry creation failed: {create_resp.text}"
        created_entry = create_resp.json()
        entry_id = created_entry.get("id")
        assert isinstance(entry_id, int), f"Invalid entry ID in creation response: {created_entry}"

        # Approve the created vehicle entry log
        approve_resp = session.put(
            f"{BASE_URL}/api/entry/{entry_id}/approve",
            headers=headers,
            timeout=TIMEOUT,
            verify=False,
        )
        assert approve_resp.status_code == 200, f"Approve request failed: {approve_resp.text}"

        # Validate response content if available for approval confirmation
        approve_json = approve_resp.json()
        # Could check for a status or confirmation property if present
        # Just assert response json is a dict and non-empty
        assert isinstance(approve_json, dict) and approve_json, "Approve response JSON empty or invalid"

    finally:
        # Cleanup: delete the created entry to keep tests idempotent
        # Assuming DELETE endpoint /api/entry/{id} exists for cleanup
        try:
            session.delete(
                f"{BASE_URL}/api/entry/{entry_id}",
                headers=headers,
                timeout=TIMEOUT,
                verify=False,
            )
        except Exception:
            pass


test_approve_vehicle_entry_log()