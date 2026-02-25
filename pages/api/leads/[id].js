// pages/api/leads/[id].js
// PUT — update a single lead's editable fields

export default async function handler(req, res) {
    if (req.method !== 'PUT') return res.status(405).end();

    const { id } = req.query;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const useKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

    try {
        let leads = [];
        if (useKV) {
            const { kv } = await import('@vercel/kv');
            const stored = await kv.get('leads');
            leads = stored ? JSON.parse(stored) : [];
        } else {
            leads = global._agencyLeads || [];
        }

        const idx = leads.findIndex(l => l.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Lead not found' });

        // Only allow editing safe fields
        const allowed = ['contactName', 'contactEmail', 'notes', 'status'];
        for (const key of allowed) {
            if (body[key] !== undefined) leads[idx][key] = body[key];
        }

        if (useKV) {
            const { kv } = await import('@vercel/kv');
            await kv.set('leads', JSON.stringify(leads));
        } else {
            global._agencyLeads = leads;
        }

        return res.json({ ok: true, lead: leads[idx] });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export const config = {
    api: { bodyParser: true },
};
