export interface Surah {
  id: number
  name: string
  transliteration: string
  translation: string
  type: 'Meccan' | 'Medinan'
  total_verses: number
}

export interface Verse {
  id: number
  surah_id: number
  verse_number: number
  global_verse_number: number
  text: string
  translation: string
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
