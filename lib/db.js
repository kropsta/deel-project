// lib/db.js
// Neon Postgres connection + schema initialization

const { Pool } = require('pg');

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 5,
        });
    }
    return pool;
}

// Create the leads table if it doesn't exist
async function initDb() {
    const db = getPool();
    await db.query(`
        CREATE TABLE IF NOT EXISTS leads (
            id          TEXT PRIMARY KEY,
            company     TEXT NOT NULL,
            title       TEXT,
            location    TEXT,
            source      TEXT,
            link        TEXT,
            search_term TEXT,
            description TEXT,
            priority    TEXT DEFAULT 'Normal',
            contact_name  TEXT DEFAULT '',
            contact_email TEXT DEFAULT '',
            notes       TEXT DEFAULT '',
            status      TEXT DEFAULT 'Not Contacted',
            created_at  TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS scrape_meta (
            key   TEXT PRIMARY KEY,
            value TEXT
        );
    `);
}

// Fetch all leads sorted by priority (HIGH first), then created_at desc
async function getLeads() {
    const db = getPool();
    const { rows } = await db.query(`
        SELECT * FROM leads
        ORDER BY CASE WHEN priority = 'HIGH' THEN 0 ELSE 1 END, created_at DESC
    `);
    // Map snake_case columns to camelCase for the frontend
    return rows.map(rowToLead);
}

// Upsert a batch of leads (ignore duplicates by id)
async function saveLeads(leads) {
    const db = getPool();
    for (const lead of leads) {
        await db.query(`
            INSERT INTO leads (id, company, title, location, source, link, search_term, description, priority, contact_name, contact_email, notes, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            ON CONFLICT (id) DO NOTHING
        `, [
            lead.id,
            lead.company || '',
            lead.title || '',
            lead.location || '',
            lead.source || '',
            lead.link || '',
            lead.searchTerm || lead.search_term || '',
            lead.description || '',
            lead.priority || 'Normal',
            lead.contactName || '',
            lead.contactEmail || '',
            lead.notes || '',
            lead.status || 'Not Contacted',
        ]);
    }
}

// Update a single lead's editable fields
async function updateLead(id, changes) {
    const db = getPool();
    const allowed = ['contact_name', 'contact_email', 'notes', 'status'];
    const map = { contactName: 'contact_name', contactEmail: 'contact_email', notes: 'notes', status: 'status' };
    const setClauses = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(changes)) {
        const col = map[key] || key;
        if (allowed.includes(col)) {
            setClauses.push(`${col} = $${idx++}`);
            values.push(val);
        }
    }
    if (setClauses.length === 0) return;
    values.push(id);
    await db.query(`UPDATE leads SET ${setClauses.join(', ')} WHERE id = $${idx}`, values);
}

// Delete all leads + reset metadata
async function clearLeads() {
    const db = getPool();
    await db.query('DELETE FROM leads');
    await db.query("DELETE FROM scrape_meta WHERE key = 'lastRun'");
}

// Last run timestamp
async function getLastRun() {
    const db = getPool();
    const { rows } = await db.query("SELECT value FROM scrape_meta WHERE key = 'lastRun'");
    return rows[0]?.value || null;
}

async function setLastRun(ts) {
    const db = getPool();
    await db.query(`
        INSERT INTO scrape_meta (key, value) VALUES ('lastRun', $1)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [ts]);
}

function rowToLead(row) {
    return {
        id: row.id,
        company: row.company,
        title: row.title,
        location: row.location,
        source: row.source,
        link: row.link,
        searchTerm: row.search_term,
        description: row.description,
        priority: row.priority,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at,
    };
}

module.exports = { initDb, getLeads, saveLeads, updateLead, clearLeads, getLastRun, setLastRun };
