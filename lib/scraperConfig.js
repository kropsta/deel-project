// lib/scraperConfig.js
// Shared search config, keywords, and sample data

const SEARCH_TERMS = [
    'health insurance agent',
    'life insurance agent',
    'medicare insurance agent',
    'ACA health insurance',
    'final expense insurance',
    'insurance call center',
    'health insurance sales',
    'medicare supplement sales',
    'warm leads insurance',
    'inbound calls insurance',
    'live transfers insurance',
    'inbound leads health insurance',
    'warm transfers medicare',
    'live transfer final expense',
];

const PRIORITY_KEYWORDS = [
    'warm leads',
    'inbound calls',
    'live transfers',
    'warm transfers',
    'inbound leads',
    'calls provided',
    'leads provided',
];

const CRAIGSLIST_CITIES = [
    'newyork', 'losangeles', 'chicago', 'houston', 'phoenix',
    'philadelphia', 'sandiego', 'dallas', 'austin', 'miami',
    'atlanta', 'seattle', 'denver', 'boston', 'tampa',
];

const SAMPLE_DATA = [
    { company: 'National Health Advisors', title: 'Health Insurance Sales Agent (Inbound Calls Provided)', location: 'Dallas, TX', source: 'Indeed', link: 'https://www.indeed.com', searchTerm: 'health insurance agent', description: 'Warm leads, inbound calls provided daily. Final expense and ACA specialists welcome.' },
    { company: 'MediCover Agency', title: 'Medicare Supplement Agent – Live Transfers', location: 'Phoenix, AZ', source: 'ZipRecruiter', link: 'https://www.ziprecruiter.com', searchTerm: 'medicare insurance agent', description: 'We provide live transfers to our agents. No cold calling required.' },
    { company: 'Freedom Final Expense', title: 'Final Expense Insurance Agent – Calls Provided', location: 'Atlanta, GA', source: 'Indeed', link: 'https://www.indeed.com', searchTerm: 'final expense insurance', description: 'Fully vetted inbound leads provided. Work from home. Warm transfers to experienced closers.' },
    { company: 'BlueSky Health Group', title: 'ACA Health Insurance Specialist', location: 'Miami, FL', source: 'Glassdoor', link: 'https://www.glassdoor.com', searchTerm: 'ACA health insurance', description: 'Leads provided through our proprietary system.' },
    { company: 'Senior Life Solutions', title: 'Medicare Advantage Sales (Remote)', location: 'Houston, TX', source: 'ZipRecruiter', link: 'https://www.ziprecruiter.com', searchTerm: 'medicare supplement sales', description: 'Inbound calls and warm transfers provided by our call center.' },
    { company: 'Apex Insurance Group', title: 'Life Insurance Sales Agent', location: 'Chicago, IL', source: 'Indeed', link: 'https://www.indeed.com', searchTerm: 'life insurance agent', description: 'Proven system with warm inbound leads. Agents average 8-12 presentations per day.' },
    { company: 'HealthBridge Agency', title: 'Health Insurance Call Center Rep', location: 'Tampa, FL', source: 'Craigslist', link: 'https://tampa.craigslist.org', searchTerm: 'insurance call center', description: 'Busy health insurance call center. Inbound call volume guaranteed.' },
    { company: 'Summit Benefits Group', title: 'Final Expense Agent – Warm Transfers Available', location: 'Denver, CO', source: 'ZipRecruiter', link: 'https://www.ziprecruiter.com', searchTerm: 'live transfer final expense', description: 'We specialize in live transfer final expense sales. 5–10 live transfers per day.' },
    { company: 'Guardian Medicare Solutions', title: 'Medicare Supplement Specialist (Inbound Leads)', location: 'Las Vegas, NV', source: 'Glassdoor', link: 'https://www.glassdoor.com', searchTerm: 'warm transfers medicare', description: 'Real-time warm transfers from compliant marketing campaigns.' },
    { company: 'Pacific Health Insurance Agency', title: 'ACA / Obamacare Enrollment Agent', location: 'Los Angeles, CA', source: 'Indeed', link: 'https://www.indeed.com', searchTerm: 'ACA health insurance', description: 'Inbound leads provided from our online campaigns.' },
    { company: 'American Senior Benefits', title: 'Life Insurance Sales – Home Office', location: 'Remote', source: 'ZipRecruiter', link: 'https://www.ziprecruiter.com', searchTerm: 'life insurance agent', description: 'Work from home with pre-qualified leads. Final expense and guaranteed issue life insurance.' },
    { company: 'Capital City Insurance', title: 'Health Sales Representative', location: 'Austin, TX', source: 'Craigslist', link: 'https://austin.craigslist.org', searchTerm: 'health insurance sales', description: 'Leads are sourced and provided. Commission-only position.' },
];

module.exports = { SEARCH_TERMS, PRIORITY_KEYWORDS, CRAIGSLIST_CITIES, SAMPLE_DATA };
