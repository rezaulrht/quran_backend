import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { quranRouter } from './routes/quran'

dotenv.config()

const app = express()
const PORT = process.env['PORT'] ?? 5000

const allowedOrigins = [
  'http://localhost:3000',
  process.env['CORS_ORIGIN'] ?? '',
  process.env['CORS_ORIGIN_2'] ?? '',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
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
