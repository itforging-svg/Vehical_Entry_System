// Format Date to IST String for Frontend
export function formatToISTString(dateObj) {
    if (!dateObj) return null;
    const d = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
    // Shift time by 5.5 hours to compensate for toISOString's UTC conversion
    const shifted = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    return shifted.toISOString().replace('Z', '+05:30');
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
