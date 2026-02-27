// lib/scraper.js
// Insurance lead scraper — powered by Google Custom Search JSON API
// Free tier: 100 queries/day. We use up to 7 per scrape run.

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { SEARCH_TERMS, PRIORITY_KEYWORDS, SAMPLE_DATA } = require('./scraperConfig');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

// ─── Priority helpers ────────────────────────────────────────────────────────

function isHighPriority(text = '') {
    const t = text.toLowerCase();
    return PRIORITY_KEYWORDS.some(kw => t.includes(kw));
}

function getPriority(lead) {
    const combined = `${lead.title || ''} ${lead.description || ''}`;
    return isHighPriority(combined) ? 'HIGH' : 'Normal';
}

// ─── Google Custom Search ────────────────────────────────────────────────────

/**
 * Search Google for insurance agency leads related to `term`.
 * Returns up to 10 structured lead objects.
 */
async function searchYahoo(term, sendStatus) {
    try {
        const url = `https://search.yahoo.com/search?p=${encodeURIComponent(term + ' insurance agency')}`;

        if (sendStatus) sendStatus(`Scraping Yahoo for: ${term}...`);
        console.log(`Searching Yahoo: ${url}`);

        // Add a small delay so we don't hammer Yahoo too fast if making multiple requests
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const response = await fetch(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Referer': 'https://search.yahoo.com/'
            },
            timeout: 10000
        });

        if (!response.ok) {
            console.error(`Yahoo Search error (Status: ${response.status}):`, response.statusText);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const results = [];

        $('.algo').each((_, el) => {
            const title = $(el).find('.compTitle h3').text().trim() || $(el).find('.title a').text().trim();
            let link = $(el).find('.compTitle a').attr('href') || $(el).find('.title a').attr('href') || '';

            // Attempt to find a snippet
            let snippet = $(el).find('.compText').text().trim() || $(el).find('.s-desc').text().trim();
            if (!snippet) {
                snippet = $(el).find('div').eq(1).text().trim();
            }

            // Extract real URL from Yahoo redirect
            const ruMatch = link.match(/\/RU=([^/]+)\//);
            if (ruMatch) {
                link = decodeURIComponent(ruMatch[1]);
            }

            if (title && link.startsWith('http')) {
                // Fallback for company name: Just try to use the domain from the link or the title
                let company = title.split('-')[0].trim();
                if (company.length > 50) company = "Insurance Agency"; // Fallback if splitting fails

                results.push({
                    source: 'Yahoo Search',
                    company: company,
                    link: link,
                    title: title,
                    description: snippet,
                    location: 'US', // Broad guess, Yahoo results are usually localized
                    priority: isHighPriority(title, snippet) ? 'High' : 'Normal',
                });
            }
        });

        if (sendStatus) sendStatus(`Found ${results.length} results for: ${term}`);
        return results;

    } catch (error) {
        console.error(`Error searching Yahoo for ${term}:`, error.message);
        if (sendStatus) sendStatus(`Failed to scrape Yahoo for: ${term} - ${error.message}`);
        return [];
    }
}
// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function toTitleCase(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Attempt to pull a US city/state from a snippet (best effort)
const STATE_RE = /\b([A-Z]{2})\b/;
const CITY_STATE_RE = /([A-Z][a-z]+(?: [A-Z][a-z]+)?),\s*([A-Z]{2})/;
function extractLocation(text) {
    const m = text.match(CITY_STATE_RE);
    if (m) return `${m[1]}, ${m[2]}`;
    const s = text.match(STATE_RE);
    if (s) return s[1];
    return '';
}

// Random User-Agent for web scraping
function getRandomUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
        "Mozilla/5.0 (X11; CrOS armv7l 13597.84.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.78",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// ─── Dedup ───────────────────────────────────────────────────────────────────

function dedup(leads) {
    const seen = new Map();
    for (const lead of leads) {
        const key = lead.company.trim().toLowerCase();
        if (!seen.has(key) || lead.priority === 'HIGH') {
            seen.set(key, lead);
        }
    }
    return [...seen.values()];
}

// ─── Main streaming generator ─────────────────────────────────────────────────

async function* runScraper(sendStatus = () => { }) {
    let allLeads = [];
    const seenLinks = new Set();
    const terms = [
        'health insurance agent',
        'medicare agent',
        'life insurance agent',
        'independent insurance broker',
        'employee benefits broker',
        'health insurance agency'
    ];

    yield { type: 'log', message: '🔎 Searching Yahoo for leads...' };

    for (const term of terms) {
        yield { type: 'log', message: `🔍 Searching Yahoo for: "${term}"` };
        const searchResults = await searchYahoo(term, sendStatus);

        for (const result of searchResults) {
            if (!seenLinks.has(result.link)) {
                seenLinks.add(result.link);
                allLeads.push(result);
                yield { type: 'log', message: `  ✅ Found: ${result.company || result.title}` };
                yield result; // yield the lead immediately for streaming
            }
        }
    }

    // Try fallback data if we completely failed
    if (allLeads.length === 0) {
        if (sendStatus) sendStatus("⚠️ Yahoo Search returned 0 results. Falling back to sample data.");
        yield { type: 'log', message: '⚠️  No results returned. Loading sample data as fallback...' };
        allLeads = SAMPLE_DATA.map(s => ({
            ...s,
            id: Math.random().toString(36).substr(2, 9),
            priority: getPriority(s),
            contactName: '', contactEmail: '', notes: '', status: 'Not Contacted',
        }));
    } else {
        // Assign IDs and statuses
        for (const lead of allLeads) {
            lead.id = Math.random().toString(36).substr(2, 9);
            lead.contactName = '';
            lead.contactEmail = '';
            lead.notes = '';
            lead.status = 'Not Contacted';
        }

        // Dedup
        const before = allLeads.length;
        allLeads = dedup(allLeads);
        yield { type: 'log', message: `🔗 Dedup: ${before} → ${allLeads.length} unique companies` };
    }

    const highCount = allLeads.filter(l => l.priority === 'HIGH').length;
    yield { type: 'log', message: `⭐ HIGH PRIORITY leads: ${highCount}` };
    yield { type: 'log', message: `✅ Scraping complete! ${allLeads.length} leads ready.` };
    yield { type: 'done', leads: allLeads };
}

module.exports = { runScraper };
