const testData = {
    plant: 'Seamless Division',
    driver_name: 'Test Driver',
    license_no: 'DL123456789',
    vehicle_type: 'LV - Sedan/SUV',
    vehicle_reg: 'GJ01AB1234',
    puc_validity: '2026-12-31',
    insurance_validity: '2026-12-31',
    chassis_last_5: '12345',
    engine_last_5: '12345',
    purpose: 'Loading',
    material_details: 'None',
    transporter: 'Test Transporter',
    aadhar_no: '123456789012',
    driver_mobile: '9876543210',
    challan_no: 'CH123',
    security_person_name: 'Security Test',
    photos: []
};

async function runTest() {
    try {
        const response = await fetch('http://localhost:5001/api/entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });
        const data = await response.json();
        if (response.ok) {
            console.log('SUCCESS:', data);
        } else {
            console.error('ERROR:', data);
        }
    } catch (err) {
        console.error('FETCH ERROR:', err.message);
    }
}

runTest();
