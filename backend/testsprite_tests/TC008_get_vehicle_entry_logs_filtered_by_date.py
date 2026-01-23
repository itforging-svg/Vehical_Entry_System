import requests
from datetime import date
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://127.0.0.1:5001"
USERNAME = "testUser"
PASSWORD = "testPassword123"
TIMEOUT = 30


def test_get_vehicle_entry_logs_filtered_by_date():
    # Login and get JWT token
    login_url = f"{BASE_URL}/api/auth/signin"
    login_payload = {"username": USERNAME, "password": PASSWORD}
    login_headers = {"Content-Type": "application/json"}

    try:
        login_response = requests.post(
            login_url, json=login_payload, headers=login_headers, timeout=TIMEOUT, verify=False
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        token = login_response.json().get("accessToken") or login_response.json().get("token")
        assert token, "No token found in login response"

        auth_headers = {"Authorization": f"Bearer {token}"}

        # Create a vehicle entry log to ensure there is at least one log for the date
        create_entry_url = f"{BASE_URL}/api/entry/"
        entry_payload = {
            "plant": "Plant1",
            "vehicle_reg": "TEST1234",
            "driver_name": "Test Driver",
            "license_no": "LIC12345",
            "vehicle_type": "Car",
            "puc_validity": str(date.today()),
            "insurance_validity": str(date.today()),
            "chassis_last_5": "ABCDE",
            "engine_last_5": "12345",
            "purpose": "Testing",
            "material_details": "None",
            "transporter": "Test Transport",
            "aadhar_no": "111122223333",
            "driver_mobile": "9999999999",
            "challan_no": "CH1234",
            "security_person_name": "Security Guard",
            "photos": []
        }

        create_response = requests.post(
            create_entry_url, json=entry_payload, headers=auth_headers, timeout=TIMEOUT, verify=False
        )
        assert create_response.status_code == 201, f"Entry creation failed: {create_response.text}"
        created_entry = create_response.json()
        created_id = created_entry.get("id")

        try:
            # Query the /api/entry/bydate with today's date
            query_date = str(date.today())
            get_logs_url = f"{BASE_URL}/api/entry/bydate"
            params = {"date": query_date}

            get_logs_response = requests.get(
                get_logs_url, headers=auth_headers, params=params, timeout=TIMEOUT, verify=False
            )
            assert get_logs_response.status_code == 200, f"Failed to get logs: {get_logs_response.text}"

            logs = get_logs_response.json()
            assert isinstance(logs, list), "Response should be a list of logs"

            # Check that the created vehicle_reg is present in the logs
            vehicle_regs = [log.get("vehicle_reg") for log in logs if log.get("vehicle_reg")]
            assert "TEST1234" in vehicle_regs, f"Created entry with vehicle_reg TEST1234 not found in logs for date {query_date}"

        finally:
            # Cleanup: delete the created entry to keep environment clean
            if created_id:
                delete_url = f"{BASE_URL}/api/entry/{created_id}/reject"
                # The API does not specify a DELETE endpoint; using reject with reason "Test cleanup"
                reject_payload = {"reason": "Test cleanup"}
                reject_response = requests.put(
                    delete_url, json=reject_payload, headers=auth_headers, timeout=TIMEOUT, verify=False
                )
                # Accept both 200 and 204 if it happens
                assert reject_response.status_code in [200, 204], f"Cleanup reject failed: {reject_response.text}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_get_vehicle_entry_logs_filtered_by_date()
