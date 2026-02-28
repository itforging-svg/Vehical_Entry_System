
const BASE_URL = 'https://vehicle-entry-api.it-forging.workers.dev/api';

async function test() {
    try {
        console.log("1. Logging in...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'cslsuperadmin',
                password: 'cslsuperadmin'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log("Login Success. Role:", loginData.roles?.[0]);

        console.log("\n2. Testing Blacklist Add...");
        const blRes = await fetch(`${BASE_URL}/blacklist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                vehicle_no: 'TEST' + Math.floor(Math.random() * 10000),
                reason: 'Verification Test'
            })
        });

        if (blRes.ok) {
            console.log("Blacklist Add: SUCCESS");
        } else {
            const blErr = await blRes.json();
            console.error("Blacklist Add: FAILED", blErr.message);
        }

        console.log("\n3. Fetching Export...");
        const exportRes = await fetch(`${BASE_URL}/entry/export?range=7d`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (exportRes.ok) {
            const text = await exportRes.text();
            console.log("Export Success! Length:", text.length);
            const lines = text.split('\n');
            if (lines.length > 1) {
                console.log("First Data Row:", lines[1]);
                const columns = lines[1].split(',');
                console.log("Entry Time (should have +05:30):", columns[6]);
            }
        } else {
            console.error("Export Failed:", await exportRes.text());
        }

    } catch (err) {
        console.error("Test Failed:", err.message);
    }
}

test();
