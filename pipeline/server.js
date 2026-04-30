import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an elite SDR intelligence assistant working for a company called "Deal" — a B2B SaaS platform that helps revenue teams close more efficiently. You help SDRs research prospects and craft personalized outreach.

When analyzing a prospect, return ONLY a valid JSON object with exactly these keys:
- snapshot: string — 2-3 sentence company summary (what they do, industry, size signals, anything notable)
- icpScore: number — integer from 0 to 100 representing ICP fit
- icpBreakdown: object with these keys:
    - companySizeFit: { score: number (0-25), rationale: string }
    - industryFit: { score: number (0-25), rationale: string }
    - likelyBudget: { score: number (0-25), rationale: string }
    - growthSignals: { score: number (0-25), rationale: string }
- coldEmail: string — a 3-paragraph cold email from an SDR at Deal. No clichés like "I hope this finds you well" or "I wanted to reach out." Make it feel human, specific, and punchy. Under 150 words total. Use \\n\\n to separate paragraphs.
- talkTrack: array of exactly 3 strings — punchy opening lines or angles for a cold call, each under 20 words

Return ONLY the JSON. No markdown fences, no explanation.`

app.post('/api/analyze', async (req, res) => {
  const { companyName, websiteUrl, prospectName, prospectTitle } = req.body

  if (!companyName || !prospectName) {
    return res.status(400).json({ error: 'companyName and prospectName are required' })
  }

  const userPrompt = `Analyze this prospect for Deal's SDR team:

Company: ${companyName}
Website: ${websiteUrl || 'not provided'}
Prospect: ${prospectName}${prospectTitle ? `, ${prospectTitle}` : ''}

Research the company based on the name and website, then return the JSON analysis.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = message.content[0].text.trim()

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse model response as JSON')
      parsed = JSON.parse(match[0])
    }

    res.json(parsed)
  } catch (err) {
    console.error('Anthropic API error:', err.message)
    res.status(500).json({ error: err.message || 'Analysis failed' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Pipeline API running on http://localhost:${PORT}`))
