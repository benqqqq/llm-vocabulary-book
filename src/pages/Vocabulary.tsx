import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import VocabularyList from '../components/Vocabulary/VocabularyList'
import VocabularyDetail from '../components/Vocabulary/VocabularyDetail'
import VocabularyInput from '../components/Vocabulary/VocabularyInput'
import type { IVocabulary } from '../components/Vocabulary/types'
import { database } from '../storage/database'

export default function Vocabulary(): ReactElement {
	const [vocabularyList, setVocabularyList] = useState<IVocabulary[]>([])
	const [selectedVocabulary, setSelectedVocabulary] = useState<IVocabulary>()

	useEffect(() => {
		const fetchVocabularyListFromDatabase = async (): Promise<void> => {
			const databaseVocabularyList = await database.vocabulary.toArray()
			setVocabularyList(databaseVocabularyList as IVocabulary[])
		}

		void fetchVocabularyListFromDatabase()
	}, [])

	const handleInputSubmit = useCallback(
		(text: string) => {
			const insertVocabularyListIntoDatabase = async (): Promise<void> => {
				const existingVocabulary = vocabularyList.find(
					vocabulary => vocabulary.word === text
				)

				if (existingVocabulary) {
					const newVocabulary = {
						...existingVocabulary,
						timestamp: new Date()
					}

					void database.vocabulary.update(existingVocabulary.id, {
						timestamp: existingVocabulary.timestamp
					})

					setVocabularyList(previousVocabularyList =>
						previousVocabularyList.map(previousVocabulary => {
							if (previousVocabulary.id === existingVocabulary.id) {
								return newVocabulary
							}
							return previousVocabulary
						})
					)
					setSelectedVocabulary(newVocabulary)
				} else {
					const newVocabularyData = {
						word: text,
						archived: false,
						timestamp: new Date()
					}

					const id = await database.vocabulary.add(newVocabularyData)

					const newVocabulary = {
						id,
						...newVocabularyData
					} as IVocabulary
					setVocabularyList(previousVocabularyList => [
						...previousVocabularyList,
						newVocabulary
					])
					setSelectedVocabulary(newVocabulary)
				}
			}

			void insertVocabularyListIntoDatabase()
		},
		[vocabularyList]
	)

	const handleVocabularyClick = useCallback((vocabulary: IVocabulary) => {
		setSelectedVocabulary(vocabulary)
	}, [])

	const handleVocabularyDeleteClick = useCallback((vocabulary: IVocabulary) => {
		const deleteVocabularyFromDatabase = async (): Promise<void> => {
			await database.vocabulary.delete(vocabulary.id)

			setVocabularyList(previousVocabularyList =>
				previousVocabularyList.filter(
					previousVocabulary => previousVocabulary.id !== vocabulary.id
				)
			)
		}

		void deleteVocabularyFromDatabase()
	}, [])

	const handleDetailGenerated = useCallback(
		(detail: string) => {
			if (!selectedVocabulary) {
				return
			}
			void database.vocabulary.update(selectedVocabulary.id, {
				detail
			})

			setVocabularyList(previousVocabularyList =>
				previousVocabularyList.map(previousVocabulary => {
					if (previousVocabulary.id === selectedVocabulary.id) {
						return {
							...previousVocabulary,
							detail
						}
					}
					return previousVocabulary
				})
			)
		},
		[selectedVocabulary]
	)

	return (
		<div className='flex h-screen'>
			<div className='w-[200px] overflow-y-scroll p-4'>
				<VocabularyList
					vocabularyList={vocabularyList}
					onVocabularyClick={handleVocabularyClick}
					onVocabularyDeleteClick={handleVocabularyDeleteClick}
				/>
			</div>
			<div className='flex max-w-[calc(100%-200px)] flex-grow flex-col'>
				<div className='p-4'>
					<VocabularyInput onSubmit={handleInputSubmit} />
				</div>
				<div className='flex-grow p-4'>
					<VocabularyDetail
						vocabulary={selectedVocabulary}
						onDetailGenerated={handleDetailGenerated}
					/>
				</div>
			</div>
		</div>
	)
}
