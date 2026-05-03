import { Request, Response } from 'express'
import { Surah, SurahWithVerses, Verse, SearchResult } from '../types/quran'
import surahsRaw from '../data/surahs.json'
import quranRaw from '../data/quran.json'
import enRaw from '../data/en.json'

interface RawSurah {
  id: number
  name: string
  transliteration: string
  translation: string
  type: string
  total_verses: number
}

interface RawVerse {
  chapter: number
  verse: number
  text: string
}

const rawSurahs = surahsRaw as RawSurah[]
const arabicData = quranRaw as Record<string, RawVerse[]>
const englishData = enRaw as Record<string, RawVerse[]>

// Build combined in-memory store once at startup
const allSurahsWithVerses: SurahWithVerses[] = []
let globalCounter = 0

for (const rawSurah of rawSurahs) {
  const arabicVerses: RawVerse[] = arabicData[String(rawSurah.id)] ?? []
  const englishVerses: RawVerse[] = englishData[String(rawSurah.id)] ?? []

  const verses: Verse[] = arabicVerses.map((av, index) => {
    globalCounter++
    const ev: RawVerse | undefined = englishVerses[index]
    return {
      id: globalCounter,
      surah_id: rawSurah.id,
      verse_number: av.verse,
      global_verse_number: globalCounter,
      text: av.text,
      translation: ev?.text ?? '',
    }
  })

  allSurahsWithVerses.push({
    id: rawSurah.id,
    name: rawSurah.name,
    transliteration: rawSurah.transliteration,
    translation: rawSurah.translation,
    type: rawSurah.type === 'meccan' ? 'Meccan' : 'Medinan',
    total_verses: rawSurah.total_verses,
    verses,
  })
}

export function getAllSurahs(_req: Request, res: Response): void {
  try {
    const surahs: Surah[] = allSurahsWithVerses.map(s => ({
      id: s.id,
      name: s.name,
      transliteration: s.transliteration,
      translation: s.translation,
      type: s.type,
      total_verses: s.total_verses,
    }))
    res.json(surahs)
  } catch (err) {
    console.error('[getAllSurahs] error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export function getSurahById(req: Request, res: Response): void {
  try {
    const id = Number(req.params['id'])
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid surah id' })
      return
    }
    if (id < 1 || id > 114) {
      res.status(404).json({ error: 'Surah not found' })
      return
    }
    const surah: SurahWithVerses | undefined = allSurahsWithVerses[id - 1]
    if (!surah) {
      res.status(404).json({ error: 'Surah not found' })
      return
    }
    res.json(surah)
  } catch (err) {
    console.error('[getSurahById] error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export function searchAyahs(req: Request, res: Response): void {
  try {
    const q = String(req.query['q'] ?? '')
    if (q.length < 2) {
      res.status(400).json({ error: 'Query must be at least 2 characters' })
      return
    }
    const lower = q.toLowerCase()
    const results: SearchResult[] = []

    outer: for (const surah of allSurahsWithVerses) {
      for (const verse of surah.verses) {
        if (verse.text.includes(q) || verse.translation.toLowerCase().includes(lower)) {
          results.push({
            surah_id: surah.id,
            surah_name: surah.name,
            surah_transliteration: surah.transliteration,
            verse_number: verse.verse_number,
            global_verse_number: verse.global_verse_number,
            text: verse.text,
            translation: verse.translation,
          })
          if (results.length >= 50) break outer
        }
      }
    }

    res.json(results)
  } catch (err) {
    console.error('[searchAyahs] error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
