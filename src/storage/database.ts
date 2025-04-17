import type { Table } from 'dexie'
import Dexie from 'dexie'

interface ICredential {
	id?: number
	name: string
	value: string
}

interface IVocabulary {
	id?: number
	word: string
	timestamp: Date
	archived: boolean
	detail?: string
	reviewCount?: number
}

export interface IReview {
	id?: number
	content: string // The full review content
	timestamp: Date
	vocabularyIds: number[]
}

const VERSION = 10

export class MySubClassedDexie extends Dexie {
	public readonly credentials!: Table<ICredential>

	public readonly vocabulary!: Table<IVocabulary>

	public readonly reviews!: Table<IReview>

	public constructor() {
		super('vocabulary-book')
		this.version(VERSION).stores({
			// Primary key and indexed props
			credentials: '++id, name',
			vocabulary: '++id, word, timestamp, archived, reviewCount',
			reviews: '++id, timestamp'
		})
	}
}

export const database = new MySubClassedDexie()
