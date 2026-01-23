import requests

BASE_URL = "http://127.0.0.1:5001"
TIMEOUT = 30


def test_retrieve_vehicle_entry_history_by_identifier():
    session = requests.Session()
    try:
        # Request history for identifier "testUser"
        history_resp = session.get(
            f"{BASE_URL}/api/entry/history/testUser",
            timeout=TIMEOUT,
            verify=False
        )
        assert history_resp.status_code == 200, f"Failed to get history: {history_resp.text}"
        history_data = history_resp.json()

        # The response can be a list of records or a dict with a 'message' key
        if isinstance(history_data, list):
            # Just confirm each record is a dictionary
            for record in history_data:
                assert isinstance(record, dict), "Record is not a dictionary"
        else:
            # Expect a dict with message key
            assert isinstance(history_data, dict), "Response is not a dict when not a list"
            assert "message" in history_data, "Response missing message key"
            assert history_data["message"] == "No previous records found", "Unexpected message content"

    finally:
        session.close()


test_retrieve_vehicle_entry_history_by_identifier()