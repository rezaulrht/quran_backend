import { Router } from 'express'
import { getAllSurahs, getSurahById, searchAyahs } from '../controllers/quranController'

export const quranRouter = Router()

quranRouter.get('/surahs', getAllSurahs)
quranRouter.get('/surah/:id', getSurahById)
quranRouter.get('/search', searchAyahs)
