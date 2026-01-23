import requests

BASE_URL = "http://127.0.0.1:5001"
TIMEOUT = 30

def test_add_vehicle_to_blacklist_with_reason():
    session = requests.Session()
    try:
        # Authenticate user to get JWT token
        auth_payload = {
            "identifier": "testUser",
            "password": "testPassword123"
        }
        auth_resp = session.post(
            f"{BASE_URL}/api/auth/signin",
            json=auth_payload,
            timeout=TIMEOUT
        )
        assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"
        auth_data = auth_resp.json()
        token = auth_data.get("accessToken") or auth_data.get("token") or auth_data.get("jwt") or auth_data.get("access_token")
        assert token, "No JWT token found in authentication response"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Add vehicle to blacklist with reason
        blacklist_payload = {
            "vehicle_no": "TEST-1234",
            "reason": "Suspicious activity detected"
        }
        resp = session.post(
            f"{BASE_URL}/api/blacklist",
            json=blacklist_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Failed to add vehicle to blacklist: {resp.text}"

        # Verify the returned data (if any)
        try:
            resp_data = resp.json()
            # If response contains added data, verify fields
            if isinstance(resp_data, dict):
                assert resp_data.get("vehicle_no") == "TEST-1234", "Returned vehicle_no mismatch"
                assert resp_data.get("reason") == "Suspicious activity detected", "Returned reason mismatch"
        except ValueError:
            # No JSON response, skip validation
            pass

    finally:
        # Cleanup: remove the blacklisted vehicle created in test
        # Try to get blacklist entries to find the new record
        try:
            list_resp = session.get(
                f"{BASE_URL}/api/blacklist",
                headers=headers,
                timeout=TIMEOUT
            )
            if list_resp.status_code == 200:
                blacklisted = list_resp.json()
                if isinstance(blacklisted, list):
                    for entry in blacklisted:
                        if entry.get("vehicle_no") == "TEST-1234":
                            # Assuming there is a DELETE endpoint or alternative to remove blacklist entry
                            # As deletion is not documented, skip removal if unavailable
                            # If DELETE exists, example:
                            # del_resp = session.delete(f"{BASE_URL}/api/blacklist/{entry['id']}", headers=headers, timeout=TIMEOUT)
                            # assert del_resp.status_code in (200,204)
                            pass
        except Exception:
            pass

test_add_vehicle_to_blacklist_with_reason()