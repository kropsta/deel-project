const fs = require('fs');
const cheerio = require('cheerio');

async function testYahooHTML() {
    const html = fs.readFileSync('yahoo.html', 'utf8');
    const $ = cheerio.load(html);

    console.log("Parsing HTML of length:", html.length);
    const results = [];
    $('.algo').each((i, el) => {
        const title = $(el).find('.compTitle h3').text().trim() || $(el).find('.title a').text().trim();
        let link = $(el).find('.compTitle a').attr('href') || $(el).find('.title a').attr('href') || '';
        const snippet = $(el).find('.compText').text().trim();

        // Extract real URL from Yahoo redirect
        const ruMatch = link.match(/\/RU=([^/]+)\//);
        if (ruMatch) {
            link = decodeURIComponent(ruMatch[1]);
        }

        if (title && link) {
            results.push({ title, snippet, link });
        }
    });

    console.log(`Found ${results.length} results.`);
    console.log(JSON.stringify(results.slice(0, 3), null, 2));
}
testYahooHTML();
