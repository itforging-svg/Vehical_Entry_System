import requests

def test_user_signin_with_valid_credentials():
    base_url = "http://127.0.0.1:5001"
    signin_url = f"{base_url}/api/auth/signin"
    payload = {
        "username": "testUser",
        "password": "testPassword123"
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(signin_url, json=payload, headers=headers, timeout=30, verify=False)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Verify JWT token presence and non-empty string
    token = data.get("accessToken") or data.get("token") or data.get("jwt")  # commonly used keys
    assert token and isinstance(token, str) and len(token) > 0, "JWT token missing or invalid in response"

    # Verify role assignment exists and is a valid string (e.g., "Admin" or "Guard")
    role = data.get("role") or data.get("roles") or data.get("userRole")
    assert role is not None, "Role not found in response"
    if isinstance(role, list):
        assert len(role) > 0 and isinstance(role[0], str), "Role list empty or invalid"
    else:
        assert isinstance(role, str) and len(role) > 0, "Role value invalid"

test_user_signin_with_valid_credentials()