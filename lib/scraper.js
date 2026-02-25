// lib/scraper.js
// JavaScript port of insurance_lead_finder.py
// Used by /api/scrape SSE endpoint

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

const HEADERS = {
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

function delay(min = 1500, max = 3000) {
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

async function getPage(url) {
    try {
        const headers = {
            ...HEADERS,
            'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
        };
        const res = await fetch(url, { headers, timeout: 10000 });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
    } catch (e) {
        return null;
    }
}

async function scrapeIndeed(term, onLog) {
    const results = [];
    const q = encodeURIComponent(term);
    const url = `https://www.indeed.com/jobs?q=${q}&l=United+States`;
    onLog(`Searching Indeed for "${term}"...`);
    const html = await getPage(url);
    await delay();
    if (!html) { onLog(`  ⚠ Indeed blocked for "${term}"`); return results; }
    const $ = cheerio.load(html);
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
    onLog(`  ✅ Indeed: found ${results.length} results for "${term}"`);
    return results.slice(0, 15);
}

async function scrapeGlassdoor(term, onLog) {
    const results = [];
    const q = encodeURIComponent(term);
    const url = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}`;
    onLog(`Searching Glassdoor for "${term}"...`);
    const html = await getPage(url);
    await delay();
    if (!html) { onLog(`  ⚠ Glassdoor blocked for "${term}"`); return results; }
    const $ = cheerio.load(html);
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
    onLog(`  ✅ Glassdoor: found ${results.length} results for "${term}"`);
    return results.slice(0, 15);
}

async function scrapeZipRecruiter(term, onLog) {
    const results = [];
    const q = encodeURIComponent(term);
    const url = `https://www.ziprecruiter.com/candidate/search?search=${q}&location=United+States`;
    onLog(`Searching ZipRecruiter for "${term}"...`);
    const html = await getPage(url);
    await delay();
    if (!html) { onLog(`  ⚠ ZipRecruiter blocked for "${term}"`); return results; }
    const $ = cheerio.load(html);
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
    onLog(`  ✅ ZipRecruiter: found ${results.length} results for "${term}"`);
    return results.slice(0, 15);
}

async function scrapeCraigslist(term, onLog) {
    const results = [];
    const cities = [...CRAIGSLIST_CITIES].sort(() => 0.5 - Math.random()).slice(0, 4);
    for (const city of cities) {
        const q = encodeURIComponent(term);
        const url = `https://${city}.craigslist.org/search/jjj?query=${q}`;
        onLog(`Searching Craigslist (${city}) for "${term}"...`);
        const html = await getPage(url);
        await delay(500, 1200);
        if (!html) continue;
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
                    company, title, location: city.charAt(0).toUpperCase() + city.slice(1),
                    source: 'Craigslist', link, searchTerm: term, description: title,
                });
            } catch (_) { }
        });
    }
    onLog(`  ✅ Craigslist: found ${results.length} results for "${term}"`);
    return results.slice(0, 20);
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

    for (const term of SEARCH_TERMS) {
        yield { type: 'log', message: `\n🔍 Searching all boards for: "${term}"` };

        const results = await Promise.allSettled([
            scrapeIndeed(term, msg => undefined),
            scrapeGlassdoor(term, msg => undefined),
            scrapeZipRecruiter(term, msg => undefined),
            scrapeCraigslist(term, msg => undefined),
        ]);

        yield { type: 'log', message: `  → Searching Indeed for "${term}"...` };
        const indeedResult = results[0].status === 'fulfilled' ? results[0].value : [];
        yield { type: 'log', message: `  ✅ Indeed: ${indeedResult.length} results` };

        yield { type: 'log', message: `  → Searching Glassdoor for "${term}"...` };
        const glassdoorResult = results[1].status === 'fulfilled' ? results[1].value : [];
        yield { type: 'log', message: `  ✅ Glassdoor: ${glassdoorResult.length} results` };

        yield { type: 'log', message: `  → Searching ZipRecruiter for "${term}"...` };
        const zipResult = results[2].status === 'fulfilled' ? results[2].value : [];
        yield { type: 'log', message: `  ✅ ZipRecruiter: ${zipResult.length} results` };

        yield { type: 'log', message: `  → Searching Craigslist for "${term}"...` };
        const clResult = results[3].status === 'fulfilled' ? results[3].value : [];
        yield { type: 'log', message: `  ✅ Craigslist: ${clResult.length} results` };

        const batch = [...indeedResult, ...glassdoorResult, ...zipResult, ...clResult];
        allLeads.push(...batch);
        scraped += batch.length;
        yield { type: 'log', message: `  📊 Subtotal: ${scraped} raw leads collected so far` };
        await delay(500, 1000);
    }

    // Assign priority
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
    yield { type: 'log', message: `\n🔗 Deduplication: ${before} → ${allLeads.length} unique companies` };

    if (allLeads.length === 0) {
        yield { type: 'log', message: `\n⚠ No live results. Loading sample data...` };
        allLeads = SAMPLE_DATA.map(s => ({
            ...s,
            id: Math.random().toString(36).substr(2, 9),
            priority: getPriority(s),
            contactName: '', contactEmail: '', notes: '', status: 'Not Contacted',
        }));
    }

    const highCount = allLeads.filter(l => l.priority === 'HIGH').length;
    yield { type: 'log', message: `⭐ HIGH PRIORITY leads: ${highCount}` };
    yield { type: 'log', message: `✅ Scraping complete! ${allLeads.length} leads ready.` };
    yield { type: 'done', leads: allLeads };
}

module.exports = { runScraper };
