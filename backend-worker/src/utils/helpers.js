// Format Date to IST String for Frontend (For Standard UTC Dates)
export function formatToISTString(dateObj) {
    if (!dateObj) return null;
    const d = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;

    // Convert to IST offset (+5.5h) manually and return String
    const istTime = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    const iso = istTime.toISOString(); // e.g. 2026-01-31T13:40:00.000Z

    // Return format that frontend likes: YYYY-MM-DDTHH:mm:ss.sss+05:30
    return iso.replace('Z', '+05:30');
}

// Format Date as Raw IST (For Dates ALREADY stored as IST in DB)
export function formatRawIST(dateObj) {
    if (!dateObj) return null;
    const d = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;

    // Isolate the date distinct parts (Values are ALREADY in IST, but Date object thinks it's Local/UTC)
    // Actually, if Postgres gave us '2026-01-31T17:30:00', new Date() might interpret as UTC.
    // We just want to output '2026-01-31T17:30:00+05:30' WITHOUT adding 5.5 hours.

    const iso = d.toISOString(); // e.g. 2026-01-31T17:30:00.000Z (If treated as UTC)
    // We just append the offset label without changing the time value?
    // Wait, if it's 17:30 in DB, new Date('...17:30') -> 17:30 UTC.
    // toISOString -> 17:30Z.
    // We want 17:30+05:30.
    return iso.replace('Z', '+05:30');
}

// Get Realtime IST
export function getRealTimeIST() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);

    const year = istTime.getUTCFullYear();
    const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istTime.getUTCDate()).padStart(2, '0');
    const hours = String(istTime.getUTCHours()).padStart(2, '0');
    const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(istTime.getUTCMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+05:30`;
}
