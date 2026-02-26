// pages/api/leads.js
// GET — return all leads | DELETE — clear all leads

const { initDb, getLeads, clearLeads, getLastRun } = require('../../lib/db');

export default async function handler(req, res) {
    try {
        await initDb();
    } catch (e) {
        console.error('DB init failed:', e.message);
        return res.status(500).json({ error: 'Database unavailable', leads: [], lastRun: null });
    }

    if (req.method === 'GET') {
        try {
            const leads = await getLeads();
            const lastRun = await getLastRun();
            return res.json({ leads, lastRun });
        } catch (e) {
            console.error('GET leads error:', e.message);
            return res.status(500).json({ error: e.message, leads: [], lastRun: null });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await clearLeads();
            return res.json({ ok: true });
        } catch (e) {
            console.error('DELETE leads error:', e.message);
            return res.status(500).json({ error: e.message });
        }
    }

    res.status(405).end();
}
