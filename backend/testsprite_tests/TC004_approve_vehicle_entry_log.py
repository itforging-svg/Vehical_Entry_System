import requests
import datetime

BASE_URL = "http://127.0.0.1:5001"
LOGIN_ENDPOINT = "/api/auth/signin"
ENTRY_ENDPOINT = "/api/entry/"
APPROVE_ENDPOINT_TEMPLATE = "/api/entry/{id}/approve"
TIMEOUT = 30

USERNAME = "testUser"
PASSWORD = "testPassword123"


def test_approve_vehicle_entry_log():
    session = requests.Session()

    # Login to get JWT token
    login_payload = {"identifier": USERNAME, "password": PASSWORD}
    try:
        login_resp = session.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=login_payload,
            timeout=TIMEOUT,
            verify=False,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        jwt_token = login_resp.json().get("accessToken") or login_resp.json().get("token")
        assert jwt_token, "No JWT token received"

        headers = {"Authorization": f"Bearer {jwt_token}"}

        # Create a new vehicle entry log to approve
        today = datetime.date.today()
        entry_payload = {
            "plant": "plant1",
            "vehicle_reg": "TEST1234",
            "driver_name": "John Doe",
            "license_no": "LIC123456",
            "vehicle_type": "Truck",
            "puc_validity": today.isoformat(),
            "insurance_validity": today.isoformat(),
            "chassis_last_5": "ABCDE",
            "engine_last_5": "12345",
            "purpose": "Delivery",
            "material_details": "Electronics",
            "transporter": "Transport Co",
            "aadhar_no": "123412341234",
            "driver_mobile": "9876543210",
            "challan_no": "CH123456",
            "security_person_name": "Security Guard 1",
            "photos": [],
        }

        create_resp = session.post(
            BASE_URL + ENTRY_ENDPOINT,
            json=entry_payload,
            headers=headers,
            timeout=TIMEOUT,
            verify=False,
        )
        assert create_resp.status_code == 201, f"Create entry failed: {create_resp.text}"
        created_entry = create_resp.json()
        entry_id = created_entry.get("id")
        if entry_id is None:
            # Sometimes id could be directly returned or under data/entry keys
            # Fallback: try to get id from response body keys if not direct
            if isinstance(created_entry, dict):
                for key in ["id", "_id"]:
                    if key in created_entry:
                        entry_id = created_entry[key]
                        break
            assert entry_id is not None, "Created entry ID not found in response"

        try:
            # Approve the vehicle entry log
            approve_resp = session.put(
                BASE_URL + APPROVE_ENDPOINT_TEMPLATE.format(id=entry_id),
                headers=headers,
                timeout=TIMEOUT,
                verify=False,
            )
            assert approve_resp.status_code == 200, f"Approve failed: {approve_resp.text}"

            # Optionally verify the response content if any
            approve_json = approve_resp.json()
            # Could check for some success flag or approved status if present
            # But minimal: just check response code 200 as per PRD

        finally:
            # Cleanup: delete the created vehicle entry log to keep DB clean
            # No explicit DELETE endpoint in PRD, so if not available, skip
            # This PRD does not specify a delete API, hence skipping cleanup step

            pass

    finally:
        session.close()


test_approve_vehicle_entry_log()