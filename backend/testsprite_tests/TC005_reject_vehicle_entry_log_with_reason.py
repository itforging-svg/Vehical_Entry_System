import requests
import datetime

BASE_URL = "http://127.0.0.1:5001"
TIMEOUT = 30
LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/signin"
ENTRY_ENDPOINT = f"{BASE_URL}/api/entry"

TEST_USER = {"identifier": "testUser", "password": "testPassword123"}


def test_reject_vehicle_entry_log_with_reason():
    session = requests.Session()
    # Login to get JWT token
    try:
        login_resp = session.post(
            LOGIN_ENDPOINT,
            json={"identifier": TEST_USER["identifier"], "password": TEST_USER["password"]},
            timeout=TIMEOUT,
            verify=False,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json().get("accessToken") or login_resp.json().get("token")
        assert token, "No token received on login"
        headers = {"Authorization": f"Bearer {token}"}

        # Create a new vehicle entry log to get an ID to reject
        entry_payload = {
            "plant": "PlantA",
            "vehicle_reg": "TEST1234",
            "driver_name": "John Doe",
            "license_no": "LIC123456",
            "vehicle_type": "Truck",
            "puc_validity": datetime.date.today().isoformat(),
            "insurance_validity": datetime.date.today().isoformat(),
            "chassis_last_5": "ABCDE",
            "engine_last_5": "12345",
            "purpose": "Delivery",
            "material_details": "Construction material",
            "transporter": "Trans Co",
            "aadhar_no": "123412341234",
            "driver_mobile": "9999999999",
            "challan_no": "CH123456",
            "security_person_name": "Security1",
            "photos": []
        }

        create_resp = session.post(ENTRY_ENDPOINT + "/", json=entry_payload, timeout=TIMEOUT, headers=headers, verify=False)
        assert create_resp.status_code == 201, f"Failed to create entry log: {create_resp.text}"
        entry_data = create_resp.json()
        entry_id = entry_data.get("id") or entry_data.get("entry_id")
        # If server does not return id in body, try to find it from Location header or error out
        if entry_id is None:
            location = create_resp.headers.get("Location")
            if location and location.rstrip("/").split("/")[-1].isdigit():
                entry_id = int(location.rstrip("/").split("/")[-1])
            else:
                raise AssertionError("Entry ID not returned by create entry endpoint")

        # Reject the vehicle entry log
        reject_reason = {"reason": "Invalid documentation"}
        reject_resp = session.put(f"{ENTRY_ENDPOINT}/{entry_id}/reject", json=reject_reason, headers=headers, timeout=TIMEOUT, verify=False)
        assert reject_resp.status_code == 200, f"Reject request failed: {reject_resp.text}"

        # Verify rejection recorded properly - if the API provides a way to fetch entry details
        # We will try to GET /api/entry/{id} or fallback to today's logs and find this entry
        entry_detail_resp = session.get(f"{ENTRY_ENDPOINT}/today", headers=headers, timeout=TIMEOUT, verify=False)
        assert entry_detail_resp.status_code == 200, f"Failed to fetch today's entries: {entry_detail_resp.text}"
        entries = entry_detail_resp.json()
        # Find the entry by ID
        entry_record = next((e for e in entries if e.get("id") == entry_id), None)
        assert entry_record is not None, "Entry record not found after reject"
        # Check if rejection reason is recorded
        # The field name for rejection reason isn't specified explicitly in the PRD, so check few possibilities
        rejection_fields = ["reject_reason", "reason", "rejection_reason", "rejectReason"]
        found_reason = None
        for field in rejection_fields:
            if field in entry_record:
                found_reason = entry_record[field]
                break
        assert found_reason == reject_reason["reason"], f"Rejection reason not recorded properly. Expected '{reject_reason['reason']}', got '{found_reason}'"
    finally:
        # Cleanup: delete the created entry log to avoid clutter
        try:
            if 'entry_id' in locals() or 'entry_id' in globals():
                del_resp = session.delete(f"{ENTRY_ENDPOINT}/{entry_id}", headers=headers, timeout=TIMEOUT, verify=False)
                # Not all APIs support delete, so do not assert here
        except Exception:
            pass


test_reject_vehicle_entry_log_with_reason()