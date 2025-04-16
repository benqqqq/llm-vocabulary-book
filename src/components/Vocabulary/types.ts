export interface IVocabulary {
	id: number
	word: string
	timestamp: Date
	archived: boolean
	detail?: string
	reviewCount?: number
}
