import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let url = '', key = '';
for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

async function check() {
    try {
        const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
        const data = await res.json();
        const transactionsDef = data.definitions?.transactions;
        if (transactionsDef) {
            const catProp = transactionsDef.properties?.category;
            fs.writeFileSync('schema-clean.txt', (catProp.enum || []).join(", "));
            console.log("Done");
        } else {
            console.log("Could not find transactions definition in OpenAPI spec.");
        }
    } catch (err) {
        console.error("Error fetching schema:", err);
    }
}
check();
