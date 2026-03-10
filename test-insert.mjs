import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let url = '', key = '';
for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('contact_messages').insert({
        user_type: "General User",
        name: "System Check",
        email: "sys@test.com",
        message: "sys checks"
    }).select();

    if (error) {
        console.error("Insert error:", error.message);
    } else {
        console.log("Insert success:", data);
    }
}

check();
