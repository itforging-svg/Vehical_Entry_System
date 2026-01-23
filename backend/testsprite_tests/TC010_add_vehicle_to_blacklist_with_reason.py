import requests

BASE_URL = "http://127.0.0.1:5001"
AUTH_URL = f"{BASE_URL}/api/auth/signin"
BLACKLIST_URL = f"{BASE_URL}/api/blacklist"

TEST_USER = {
    "username": "testUser",
    "password": "testPassword123"
}

def test_add_vehicle_to_blacklist_with_reason():
    timeout = 30
    session = requests.Session()
    try:
        # Authenticate and get JWT token
        auth_resp = session.post(AUTH_URL, json=TEST_USER, timeout=timeout, verify=False)
        assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"
        token = auth_resp.json().get("accessToken") or auth_resp.json().get("token")
        assert token, "JWT token not found in auth response"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Prepare blacklist entry data
        vehicle_no = "TEST-1234"
        reason = "Suspicious activity detected"

        payload = {
            "vehicle_no": vehicle_no,
            "reason": reason
        }

        # Add vehicle to blacklist
        post_resp = session.post(BLACKLIST_URL, json=payload, headers=headers, timeout=timeout, verify=False)
        assert post_resp.status_code == 201, f"Failed to add vehicle to blacklist: {post_resp.text}"
        resp_data = post_resp.json()
        # Validate response data contains the added vehicle_no and reason (if returned)
        if isinstance(resp_data, dict):
            # Maybe the API returns the created record details
            assert resp_data.get("vehicle_no") == vehicle_no or resp_data.get("vehicleNo") == vehicle_no, "Vehicle number in response does not match"
            assert reason in (resp_data.get("reason") or ""), "Reason in response does not match"
    finally:
        # Clean up: attempt to remove the added blacklist entry to maintain test isolation
        # Assuming there is a DELETE method, but none specified in PRD
        # If no delete endpoint, then skip cleanup
        pass

test_add_vehicle_to_blacklist_with_reason()
