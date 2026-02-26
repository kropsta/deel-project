// lib/scraper.js
// Insurance lead scraper - streaming async generator
// Strategy: short timeout per request, 2 Craigslist cities max, fast fallback.

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { SEARCH_TERMS, PRIORITY_KEYWORDS, SAMPLE_DATA, CRAIGSLIST_CITIES } = require('./scraperConfig');

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
];

function randUA() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(min = 400, max = 900) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isHighPriority(text = '') {
    const t = text.toLowerCase();
    return PRIORITY_KEYWORDS.some(kw => t.includes(kw));
}

function getPriority(lead) {
    const combined = `${lead.title || ''} ${lead.description || ''}`;
    return isHighPriority(combined) ? 'HIGH' : 'Normal';
}

// Fetch with short timeout + random UA
async function getPage(url, timeoutMs = 6000) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, {
            headers: {
                'User-Agent': randUA(),
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) return null;
        return await res.text();
    } catch (e) {
        return null;
    }
}

async function scrapeIndeed(term) {
    const q = encodeURIComponent(term);
    const html = await getPage(`https://www.indeed.com/jobs?q=${q}&l=United+States`);
    if (!html) return [];
    const $ = cheerio.load(html);
    const results = [];
    $('div.job_seen_beacon, div.resultContent').each((_, el) => {
        try {
            const titleEl = $(el).find('h2.jobTitle a, h2 a').first();
            const compEl = $(el).find('[data-testid="company-name"], .companyName').first();
            const locEl = $(el).find('[data-testid="text-location"], .companyLocation').first();
            const descEl = $(el).find('.job-snippet').first();
            if (!titleEl.length || !compEl.length) return;
            const href = titleEl.attr('href') || '';
            results.push({
                company: compEl.text().trim(),
                title: titleEl.text().trim(),
                location: locEl.text().trim() || 'US',
                source: 'Indeed',
                link: href.startsWith('/') ? `https://www.indeed.com${href}` : href,
                searchTerm: term,
                description: descEl.text().trim(),
            });
        } catch (_) { }
    });
    return results.slice(0, 10);
}

async function scrapeGlassdoor(term) {
    const q = encodeURIComponent(term);
    const html = await getPage(`https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}`);
    if (!html) return [];
    const $ = cheerio.load(html);
    const results = [];
    $('li.react-job-listing, [data-test="jobListing"]').each((_, el) => {
        try {
            const titleEl = $(el).find('a.jobLink, [data-test="job-link"]').first();
            const compEl = $(el).find('[data-test="employer-name"]').first();
            const locEl = $(el).find('[data-test="emp-location"]').first();
            if (!titleEl.length || !compEl.length) return;
            const href = titleEl.attr('href') || '';
            results.push({
                company: compEl.text().trim(),
                title: titleEl.text().trim(),
                location: locEl.text().trim() || 'US',
                source: 'Glassdoor',
                link: href.startsWith('/') ? `https://www.glassdoor.com${href}` : href,
                searchTerm: term,
                description: titleEl.text().trim(),
            });
        } catch (_) { }
    });
    return results.slice(0, 10);
}

async function scrapeZipRecruiter(term) {
    const q = encodeURIComponent(term);
    const html = await getPage(`https://www.ziprecruiter.com/candidate/search?search=${q}&location=United+States`);
    if (!html) return [];
    const $ = cheerio.load(html);
    const results = [];
    $('article.job_result, [class*="job_result"]').each((_, el) => {
        try {
            const titleEl = $(el).find('h2 a, .job_title a').first();
            const compEl = $(el).find('.company_name').first();
            const locEl = $(el).find('.location').first();
            const descEl = $(el).find('.job_description').first();
            if (!titleEl.length || !compEl.length) return;
            const href = titleEl.attr('href') || '';
            results.push({
                company: compEl.text().trim(),
                title: titleEl.text().trim(),
                location: locEl.text().trim() || 'US',
                source: 'ZipRecruiter',
                link: href.startsWith('http') ? href : `https://www.ziprecruiter.com${href}`,
                searchTerm: term,
                description: descEl.text().trim(),
            });
        } catch (_) { }
    });
    return results.slice(0, 10);
}

async function scrapeCraigslist(term) {
    const results = [];
    // Only hit 2 cities to stay fast
    const cities = [...CRAIGSLIST_CITIES].sort(() => 0.5 - Math.random()).slice(0, 2);
    await Promise.all(cities.map(async city => {
        const q = encodeURIComponent(term);
        const html = await getPage(`https://${city}.craigslist.org/search/jjj?query=${q}`, 5000);
        if (!html) return;
        const $ = cheerio.load(html);
        $('li.result-row, [data-pid]').each((_, el) => {
            try {
                const titleEl = $(el).find('.result-title, a.result-title').first();
                if (!titleEl.length) return;
                const title = titleEl.text().trim();
                const href = titleEl.attr('href') || '';
                const link = href.startsWith('http') ? href : `https://${city}.craigslist.org${href}`;
                const company = title.includes(' - ') ? title.split(' - ').pop().trim() : title;
                results.push({
                    company, title,
                    location: city.charAt(0).toUpperCase() + city.slice(1),
                    source: 'Craigslist', link, searchTerm: term, description: title,
                });
            } catch (_) { }
        });
    }));
    return results.slice(0, 10);
}

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

async function* runScraper() {
    let allLeads = [];
    let scraped = 0;
    let blockedCount = 0;

    // Use only the top 7 most targeted search terms to stay well under 60s timeout
    const terms = SEARCH_TERMS.slice(0, 7);

    for (const term of terms) {
        yield { type: 'log', message: `🔍 Searching all boards for: "${term}"` };

        // Run all 4 boards in parallel — no sequential delays between boards
        const [indeedResult, glassdoorResult, zipResult, clResult] = await Promise.all([
            scrapeIndeed(term),
            scrapeGlassdoor(term),
            scrapeZipRecruiter(term),
            scrapeCraigslist(term),
        ]);

        const boardResults = { Indeed: indeedResult, Glassdoor: glassdoorResult, ZipRecruiter: zipResult, Craigslist: clResult };
        let termTotal = 0;
        for (const [board, res] of Object.entries(boardResults)) {
            if (res.length === 0) blockedCount++;
            termTotal += res.length;
            yield { type: 'log', message: `  ✅ ${board}: ${res.length} results` };
        }

        const batch = [...indeedResult, ...glassdoorResult, ...zipResult, ...clResult];
        allLeads.push(...batch);
        scraped += batch.length;
        yield { type: 'log', message: `  📊 Subtotal: ${scraped} raw leads so far` };

        // Short pause between search terms
        await delay(200, 500);
    }

    // Assign IDs and priority
    for (const lead of allLeads) {
        lead.priority = getPriority(lead);
        lead.id = Math.random().toString(36).substr(2, 9);
        lead.contactName = '';
        lead.contactEmail = '';
        lead.notes = '';
        lead.status = 'Not Contacted';
    }

    // Dedup
    const before = allLeads.length;
    allLeads = dedup(allLeads);
    yield { type: 'log', message: `🔗 Deduplication: ${before} → ${allLeads.length} unique companies` };

    // Full fallback if all blocked
    if (allLeads.length === 0) {
        yield { type: 'log', message: `⚠ No live results found (job boards are blocking scraper). Loading sample data...` };
        allLeads = SAMPLE_DATA.map(s => ({
            ...s,
            id: Math.random().toString(36).substr(2, 9),
            priority: getPriority(s),
            contactName: '', contactEmail: '', notes: '', status: 'Not Contacted',
        }));
        yield { type: 'log', message: `ℹ️  Sample data represents typical buy-side insurance agency job postings.` };
    }

    const highCount = allLeads.filter(l => l.priority === 'HIGH').length;
    yield { type: 'log', message: `⭐ HIGH PRIORITY leads: ${highCount}` };
    yield { type: 'log', message: `✅ Scraping complete! ${allLeads.length} leads ready.` };
    yield { type: 'done', leads: allLeads };
}

module.exports = { runScraper };
