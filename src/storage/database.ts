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

const VERSION = 9

export class MySubClassedDexie extends Dexie {
	public readonly credentials!: Table<ICredential>

	public readonly vocabulary!: Table<IVocabulary>

	public constructor() {
		super('vocabulary-book')
		this.version(VERSION).stores({
			// Primary key and indexed props
			credentials: '++id, name',
			vocabulary: '++id, word, timestamp, archived, reviewCount'
		})
	}
}

export const database = new MySubClassedDexie()
