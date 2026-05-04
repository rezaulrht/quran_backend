# Quran Web App — Backend API

## Live API
🔗 [https://quran-backend-delta-ecru.vercel.app](https://quran-backend-delta-ecru.vercel.app)

## Related
- Frontend Repo: [https://github.com/rezaulrht/quran_frontend](https://github.com/rezaulrht/quran_frontend)
- Frontend Live: [https://quran-mazid-liart.vercel.app](https://quran-mazid-liart.vercel.app)

## Overview
Express + TypeScript REST API serving Quran JSON data to the frontend. All 114 surahs and 6236 verses loaded into memory at startup for fast response times.

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Language | TypeScript (CommonJS) |
| Deployment | Vercel |

## API Endpoints

```
GET /health                    → { status: 'ok' }
GET /api/surahs                → all 114 surahs metadata
GET /api/surah/:id             → single surah with all verses + translations
GET /api/search?q={query}      → search verses by Arabic or English text
```

### Example Responses

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

`GET /api/surah/1`
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
      "text": "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
      "translation": "In the name of Allah, the Entirely Merciful, the Especially Merciful"
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
    "text": "بِسۡمِ ٱللَّهِ...",
    "translation": "In the name of Allah, the Entirely Merciful..."
  }
]
```

## Local Setup
```bash
# Clone the repo
git clone https://github.com/rezaulrht/quran_backend
cd quran_backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000" > .env
echo "CORS_ORIGIN=http://localhost:3000" >> .env

# Run development server
npm run dev
```
API runs on [http://localhost:5000](http://localhost:5000)

## Project Structure
```
src/
├── index.ts              ← Express app setup, middleware, route registration
├── routes/
│   └── quran.ts          ← Route definitions
├── controllers/
│   └── quranController.ts ← Business logic, data loading, search
├── types/
│   └── quran.ts          ← TypeScript interfaces
└── data/
    ├── surahs.json       ← 114 surah metadata
    └── verses/           ← Per-surah verse files (1.json - 114.json)
```

## Data Source
Quran JSON from [github.com/risan/quran-json](https://github.com/risan/quran-json)
Translation: Saheeh International
Global verse numbers pre-calculated at startup for audio CDN compatibility.

## Known Limitations
- Vercel serverless functions have cold start delay on first request
- Search is in-memory — returns max 50 results
