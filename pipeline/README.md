# Pipeline — SDR Intelligence Tool

AI-powered prospect research and personalization for modern SDRs. Enter a company name and prospect, and Pipeline generates a company snapshot, ICP qualification score, personalized cold email, and talk track in seconds — all powered by Claude.

---

## Local Setup

### 1. Install dependencies

```bash
cd pipeline
npm install
```

### 2. Add your Anthropic API key

Copy the example env file and add your key:

```bash
cp .env.example .env
```

Then edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

Get your API key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run the app

```bash
npm run dev
```

This starts both the Express API server (`localhost:3001`) and the Vite dev server (`localhost:5173`) concurrently. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deploy to Vercel

### Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- A Vercel account

### One-command deploy

From inside the `pipeline` directory:

```bash
vercel --prod
```

### Add the API key in Vercel

After deploying, set your environment variable:

```bash
vercel env add ANTHROPIC_API_KEY
```

Or set it in the Vercel dashboard under **Project → Settings → Environment Variables**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Express.js (Node) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Deployment | Vercel |

---

## Project Structure

```
pipeline/
├── src/
│   ├── components/
│   │   ├── ScoreGauge.jsx    # Animated SVG ring gauge + breakdown bars
│   │   ├── ResultCard.jsx    # Snapshot, cold email, talk track cards
│   │   └── SkeletonLoader.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── lightning.svg
├── server.js          # Express API — keeps API key server-side
├── vercel.json        # Routes /api/* to Express, rest to static
├── .env.example
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## How It Works

1. User fills in company name, website URL, and prospect name/title
2. Frontend POSTs to `/api/analyze`
3. Express server calls Claude with a structured prompt requesting JSON output
4. Claude returns: `snapshot`, `icpScore`, `icpBreakdown`, `coldEmail`, `talkTrack`
5. Frontend renders results with animated score gauge, copy buttons, and skeleton loaders

The API key never touches the browser.
