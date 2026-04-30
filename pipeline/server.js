import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DEEL_CONTEXT = `
Deel is a global HR and payroll platform for startups and SMBs (1–200 employees). Deel helps companies hire, manage, and pay their teams anywhere in the world.

Key products:
- Deel EOR: Hire full-time employees in 100+ countries without setting up a local legal entity
- Deel Contractor Management: Onboard and pay global contractors compliantly, with misclassification protection
- Deel Global Payroll: Run multi-country payroll from one platform
- Deel HR (HRIS): Free global HRIS replacing BambooHR, Lattice, and 14 other tools
- Deel PEO: Co-employment for US companies, Fortune 500-level benefits
- Deel IT: Device provisioning and MDM for distributed teams
- Deel Benefits: Localized benefits synced to payroll

Deel's sweet spot: seed and pre-seed startups that are remote-first, have global ambitions, or are starting to hire internationally. These companies are too small for enterprise HCM tools, moving too fast for manual processes, and need compliance coverage as they grow.

Target buyers: Founders, CEOs, COOs, HR Managers, People Ops, Head of People — anyone owning hiring and team management.

Pain points Deel solves: setting up entities abroad, paying contractors in multiple currencies, staying compliant across countries, onboarding international hires fast, replacing fragmented HR tools.
`

const PARSE_PROMPT = `You are a funding intelligence analyst for Deel's SDR team. You receive raw text from recent news articles about startup funding rounds.

Your job: extract every distinct startup mentioned that raised a pre-seed or seed round. For each one, return a structured JSON array.

For each company include:
- name: string
- stage: "Pre-seed" | "Seed"
- amount: string (e.g. "$2.5M", "undisclosed")
- description: string — one sentence on what the company does
- industry: string — e.g. "HR Tech", "Fintech", "SaaS", "E-commerce", "HealthTech", etc.
- location: string — city/country if mentioned, else "Unknown"
- teamSize: string — if mentioned, else "Early stage"
- fundedDate: string — approximate date if mentioned, else "Recent"
- whyDeel: string — one sentence on the most relevant Deel product for this company and why (focus on: international hiring, contractor payments, global payroll, remote team management)
- icpScore: number — 0 to 100 score for Deel's ICP fit. Score higher for: remote-first, international teams, hiring across borders, fast-growing, VC-backed. Score lower for: purely domestic, non-tech, already using enterprise HCM.

Return ONLY a valid JSON array. No markdown fences. No explanation. If no pre-seed or seed companies are found, return an empty array [].`

const OUTREACH_PROMPT = `You are an SDR at Deel — a global HR and payroll platform for startups. Write outreach for a specific recently funded startup.

${DEEL_CONTEXT}

OUTREACH RULES:
- Address the prospect by first name
- Email must speak to their specific situation as a newly funded startup: building out their team, hiring internationally, managing remote workers, staying compliant
- Tie paragraph 1 to something specific about their company (what they do, their funding, their growth stage)
- Paragraph 2: connect to a specific Deel product that solves their pain
- Paragraph 3: low-friction CTA — "worth a 15-minute call?" style
- NO clichés: no "I hope this finds you well", no "I wanted to reach out", no "touching base", no "synergy"
- Under 150 words total
- Talk track should feel like natural cold call openers, not scripts

Return ONLY valid JSON with keys: coldEmail (string, \\n\\n between paragraphs), talkTrack (array of 3 strings, each under 20 words).`

async function searchExa(query, daysBack) {
  const body = {
    query,
    numResults: 10,
    contents: { text: true },
  }

  if (daysBack) {
    body.startPublishedDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
  }

  console.log('Exa request:', JSON.stringify({ query, daysBack, startPublishedDate: body.startPublishedDate }))

  const res = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.EXA_API_KEY,
    },
    body: JSON.stringify(body),
  })

  const responseText = await res.text()
  console.log('Exa response status:', res.status, 'body:', responseText.slice(0, 300))

  if (!res.ok) {
    throw new Error(`Exa API error ${res.status}: ${responseText}`)
  }

  const data = JSON.parse(responseText)
  return data.results || []
}

app.post('/api/find-startups', async (req, res) => {
  const { industry = 'all', region = 'all', daysBack = 30 } = req.body

  const industryClause = industry !== 'all' ? ` in ${industry}` : ''
  const regionClause = region !== 'all' ? ` in ${region}` : ''

  const queries = [
    `startup just announced seed funding round${industryClause}${regionClause}`,
    `new company raised pre-seed or seed investment to build${industryClause}${regionClause}`,
    `early stage startup secures funding to hire global team${regionClause}`,
  ]

  try {
    const allResults = []
    const seen = new Set()

    for (const query of queries) {
      try {
        const results = await searchExa(query, daysBack)
        for (const r of results) {
          if (!seen.has(r.url)) {
            seen.add(r.url)
            allResults.push(r)
          }
        }
      } catch (e) {
        console.warn('Exa query failed:', query, e.message)
      }
    }

    console.log(`Exa returned ${allResults.length} total articles`)

    if (allResults.length === 0) {
      return res.status(500).json({ error: 'Exa returned no articles. Check the Vercel runtime logs for the exact error — likely an invalid or inactive EXA_API_KEY.' })
    }

    const articlesText = allResults
      .slice(0, 20)
      .map((r, i) =>
        `[${i + 1}] TITLE: ${r.title}\nDATE: ${r.publishedDate || 'unknown'}\nURL: ${r.url}\nCONTENT: ${r.text || '(no content)'}`
      )
      .join('\n\n---\n\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: PARSE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here are recent articles. Extract ALL startups that raised any funding (pre-seed, seed, or early stage). Be inclusive — include any company that received investment, even if the stage isn't explicitly labeled. Return as many as you can find:\n\n${articlesText}`,
        },
      ],
    })

    const raw = message.content[0].text.trim()
    let companies
    try {
      companies = JSON.parse(raw)
    } catch {
      const match = raw.match(/\[[\s\S]*\]/)
      if (!match) {
        console.error('Raw model response:', raw.slice(0, 500))
        throw new Error('Could not parse company list from model response')
      }
      companies = JSON.parse(match[0])
    }

    res.json(Array.isArray(companies) ? companies : [])
  } catch (err) {
    console.error('find-startups error:', err.message)
    res.status(500).json({ error: err.message || 'Failed to find startups' })
  }
})

app.post('/api/generate-outreach', async (req, res) => {
  const { company, prospectName, prospectTitle } = req.body

  if (!company || !prospectName) {
    return res.status(400).json({ error: 'company and prospectName are required' })
  }

  const userPrompt = `Generate Deel outreach for this newly funded startup:

Company: ${company.name}
What they do: ${company.description}
Funding: ${company.stage} — ${company.amount}
Location: ${company.location}
Industry: ${company.industry}
Why Deel fits: ${company.whyDeel}

Prospect: ${prospectName}${prospectTitle ? `, ${prospectTitle}` : ''}

Write the cold email and talk track.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: OUTREACH_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = message.content[0].text.trim()
    let result
    try {
      result = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse outreach from model response')
      result = JSON.parse(match[0])
    }

    res.json(result)
  } catch (err) {
    console.error('generate-outreach error:', err.message)
    res.status(500).json({ error: err.message || 'Failed to generate outreach' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Pipeline API running on http://localhost:${PORT}`))
