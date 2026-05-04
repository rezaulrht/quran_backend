import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { quranRouter } from './routes/quran'

dotenv.config()

const app = express()
const PORT = process.env['PORT'] ?? 5000

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'https://quran-mazid-liart.vercel.app',
      process.env['CORS_ORIGIN'] ?? '',
    ].filter(Boolean)

    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Quran API running' })
})

app.use('/api', quranRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
