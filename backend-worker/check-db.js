
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log("Checking vehicle_blacklist schema...");
    const { data: blData, error: blError } = await supabase
        .from('vehicle_blacklist')
        .select('*')
        .limit(1);

    if (blError) console.error("BL Error:", blError);
    else console.log("BL Columns:", Object.keys(blData[0] || {}));

    console.log("\nChecking entry_logs schema...");
    const { data: elData, error: elError } = await supabase
        .from('entry_logs')
        .select('*')
        .limit(1);

    if (elError) console.error("EL Error:", elError);
    else console.log("EL Columns:", Object.keys(elData[0] || {}));
}

checkSchema();
