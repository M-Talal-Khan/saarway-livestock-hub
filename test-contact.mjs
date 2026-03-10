import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let url = '', key = '';
for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

async function testPOST() {
    const payload = {
        user_type: "General User",
        name: "Test",
        email: "test@test.com",
        phone: "123",
        message: "test message"
    };

    const res = await fetch(`${url}/rest/v1/contact_messages`, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.text();
        console.error('Error insert:', err);
    } else {
        const data = await res.json();
        console.log('Success insert:', data);
    }
}

testPOST();
