import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let url = '', key = '';
for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

// Create a direct Postgres REST call using the custom RPC `rpc('get_schema')` if available, 
// or let's just select * limit 1 to see the columns returned in JSON
async function check() {
    const res = await fetch(`${url}/rest/v1/contact_messages?select=*&limit=1`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const data = await res.json();
    console.log("Raw GET Data:", data);
}

check();
