import requests

def test_user_signin_with_valid_credentials():
    base_url = "http://127.0.0.1:5001"
    signin_endpoint = f"{base_url}/api/auth/signin"
    payload = {
        "identifier": "testUser",
        "password": "testPassword123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(signin_endpoint, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

    try:
        response_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Assert JWT token presence
    token = response_json.get("accessToken") or response_json.get("token") or response_json.get("jwt")
    assert token and isinstance(token, str) and len(token) > 0, "JWT token not found in response"

    # Assert role assignment presence and validity
    role = response_json.get("role") or response_json.get("roles")
    assert role, "Role not found in response"
    if isinstance(role, list):
        assert all(isinstance(r, str) and r for r in role), "Role list contains invalid entries"
    else:
        assert isinstance(role, str) and role, "Role is not valid string"

test_user_signin_with_valid_credentials()