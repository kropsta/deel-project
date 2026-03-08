const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
});
const fetch = require('node-fetch');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

console.log("Key length:", GOOGLE_API_KEY ? GOOGLE_API_KEY.length : 0);
console.log("CX length:", GOOGLE_CSE_ID ? GOOGLE_CSE_ID.length : 0);

async function testGoogle() {
    const term = "health insurance agent";
    const query = encodeURIComponent(`${term} insurance agency`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${query}&num=2`;

    console.log("Testing URL:", url.replace(GOOGLE_API_KEY, 'HIDDEN_KEY'));
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const err = await res.json();
            console.error("HTTP Error:", res.status, res.statusText);
            fs.writeFileSync('error.json', JSON.stringify(err, null, 2));
            console.error("Wrote error to error.json");
            return;
        }
        const data = await res.json();
        const items = data.items || [];
        console.log(`Found ${items.length} items`);
        if (items.length > 0) {
            console.log("Sample title:", items[0].title);
        } else {
            console.log("No items returned! Inspecting response object:", Object.keys(data));
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testGoogle();
