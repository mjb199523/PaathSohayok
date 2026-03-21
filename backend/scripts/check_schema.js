const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("Checking profiles table...");
    const { data: profiles, error: pError } = await supabaseAdmin.from('profiles').select('*').limit(1);
    
    if (pError) {
        console.error("Profiles error:", pError);
    } else {
        console.log("Profile data sample:", profiles?.[0]);
        console.log("Profile keys:", Object.keys(profiles?.[0] || {}));
    }
}

checkSchema();
