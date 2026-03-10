import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let url = '', key = '';
for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

async function reloadCache() {
    const res = await fetch(`${url}/rest/v1/`, {
        method: 'OPTIONS', // Sometimes options triggers a reload, but usually NOTIFY is needed on db
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
        }
    });

    // Sending a request to postgres directly via RPC if possible (requires a custom function)
    // The easiest way to reload cache is just wait, or use the Dashboard.
    // There is a built in endpoint to reload if using self-hosted, but on Cloud usually dashboard is it.

    console.log('Options status:', res.status);
}

reloadCache();
