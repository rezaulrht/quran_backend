# Quran Web App — Backend CLAUDE.md

## Project
Quran Web App — Express + TypeScript backend
Serves Quran JSON data to the Next.js frontend at http://localhost:3000

## Stack
- Node.js + Express 4
- TypeScript (strict, CommonJS)
- cors, dotenv
- ts-node-dev (dev server)

---

## Folder Structure
```
src/
├── index.ts                   ← app setup, middleware, route registration only
├── routes/
│   └── quran.ts               ← route definitions only, calls controllers
├── controllers/
│   └── quranController.ts     ← all business logic
├── types/
│   └── quran.ts               ← shared TypeScript interfaces
└── data/
    ├── surahs.json            ← 114 surah metadata
    └── verses/
        └── {1..114}.json      ← per-surah ayah files from quran-json
```

---

## API Endpoints

```
GET  /health                   → { status: 'ok', message: 'Quran API running' }
GET  /api/surahs               → all 114 surahs metadata (no ayahs)
GET  /api/surah/:id            → single surah + all ayahs with translation
GET  /api/search?q={query}     → search ayahs by arabic or english text
```

### Response Shapes

`GET /api/surahs`
```json
[
  {
    "id": 1,
    "name": "الفاتحة",
    "transliteration": "Al-Fatihah",
    "translation": "The Opener",
    "type": "Meccan",
    "total_verses": 7
  }
]
```

`GET /api/surah/:id`
```json
{
  "id": 1,
  "name": "الفاتحة",
  "transliteration": "Al-Fatihah",
  "translation": "The Opener",
  "type": "Meccan",
  "total_verses": 7,
  "verses": [
    {
      "id": 1,
      "surah_id": 1,
      "verse_number": 1,
      "global_verse_number": 1,
      "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "translation": "In the name of Allah, the Entirely Merciful, the Especially Merciful."
    }
  ]
}
```

`GET /api/search?q=merciful`
```json
[
  {
    "surah_id": 1,
    "surah_name": "الفاتحة",
    "surah_transliteration": "Al-Fatihah",
    "verse_number": 1,
    "global_verse_number": 1,
    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "translation": "In the name of Allah..."
  }
]
```

---

## TypeScript Interfaces
Define ONCE in `src/types/quran.ts` — import everywhere:

```typescript
export interface Surah {
  id: number
  name: string              // Arabic name e.g. "الفاتحة"
  transliteration: string   // e.g. "Al-Fatihah"
  translation: string       // English meaning e.g. "The Opener"
  type: 'Meccan' | 'Medinan'
  total_verses: number
}

export interface Verse {
  id: number
  surah_id: number
  verse_number: number
  global_verse_number: number  // pre-calculated at startup
  text: string                 // Arabic text
  translation: string          // Saheeh International English
}

export interface SurahWithVerses extends Surah {
  verses: Verse[]
}

export interface SearchResult {
  surah_id: number
  surah_name: string
  surah_transliteration: string
  verse_number: number
  global_verse_number: number
  text: string
  translation: string
}
```

---

## Data Loading Rules
- Load ALL JSON files ONCE at module level (startup) — cache in memory
- NEVER read files on each request
- Pre-calculate `global_verse_number` for every verse at startup:

```ts
// Global verse number calculation
// Surah 1, verse 1 → global 1
// Surah 2, verse 1 → global 8  (7 verses in surah 1)
// Surah 2, verse 2 → global 9
let globalCounter = 0
for (const surah of allSurahs) {
  for (const verse of surah.verses) {
    globalCounter++
    verse.global_verse_number = globalCounter
  }
}
```

---

## Controller Rules
- Every handler: `(req: Request, res: Response): void`
- Validate `:id`:
  - Not a number → 400
  - Outside 1–114 → 404
- Wrap all in try/catch → 500 on error
- Log errors: `console.error('[getSurah] error:', err)`
- Status codes: 200 success | 400 bad request | 404 not found | 500 server error

## Route Rules
- Routes file: map paths to controller functions only — no logic
- Register in index.ts: `app.use('/api', quranRouter)`

## Search Rules
- Query param: `q`
- Less than 2 chars → return 400
- Case-insensitive on both `text` (Arabic) and `translation` (English)
- Max 50 results
- No results → return `[]` not 404

---

## index.ts
```ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { quranRouter } from './routes/quran'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 5000

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Quran API running' })
})

app.use('/api', quranRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

---

## Environment Variables
`.env`:
```
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Scripts
```json
{
  "dev":   "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

---

## Absolute Rules
- TypeScript strict — never `any`
- `tsc --noEmit` after every file — fix before continuing
- CommonJS only — `require()` not `import/export`
- Logic in controllers only — routes just map paths
- Load JSON once at startup — never per request
- Commit after each feature

## Do NOT
- Use `any` type
- Put logic in route files
- Read JSON on every request
- Hardcode PORT or CORS_ORIGIN
- Return HTML errors — always JSON
- Use Express 5 features
- Use ES module `import/export` syntax
- Install packages without confirming