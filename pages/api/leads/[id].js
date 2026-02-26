// pages/api/leads/[id].js
// PUT — update editable fields (contactName, contactEmail, notes, status) for a lead

const { initDb, updateLead } = require('../../../lib/db');

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'PUT') return res.status(405).end();

    try {
        await initDb();
        await updateLead(id, req.body);
        return res.json({ ok: true });
    } catch (e) {
        console.error('Update lead error:', e.message);
        return res.status(500).json({ error: e.message });
    }
}
