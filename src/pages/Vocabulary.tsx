import { Alert, Paper } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import VocabularyDetail from '../components/Vocabulary/VocabularyDetail'
import VocabularyInput from '../components/Vocabulary/VocabularyInput'
import VocabularyList from '../components/Vocabulary/VocabularyList'
import type { IVocabulary } from '../components/Vocabulary/types'
import Setting from '../components/common/Setting'
import { useSettingContext } from '../services/SettingContext'
import { database } from '../storage/database'

export default function Vocabulary(): ReactElement {
	const [vocabularyList, setVocabularyList] = useState<IVocabulary[]>([])
	const [selectedVocabulary, setSelectedVocabulary] = useState<IVocabulary>()
	const [showApiKeyAlert, setShowApiKeyAlert] = useState(false)
	const { setting } = useSettingContext()

	useEffect(() => {
		const fetchVocabularyListFromDatabase = async (): Promise<void> => {
			const databaseVocabularyList = await database.vocabulary.toArray()
			setVocabularyList(databaseVocabularyList as IVocabulary[])
		}

		void fetchVocabularyListFromDatabase()
	}, [])

	const handleInputSubmit = useCallback(
		(text: string) => {
			// Check if API key exists
			if (!setting.openaiApiKey) {
				setShowApiKeyAlert(true)
				return
			}
			
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
		[vocabularyList, setting.openaiApiKey]
	)

	// Reset alert when API key is added
	useEffect(() => {
		if (setting.openaiApiKey) {
			setShowApiKeyAlert(false)
		}
	}, [setting.openaiApiKey])

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
		<div className='flex h-screen flex-col'>
			<div className='flex justify-between items-center p-4 border-b'>
				<h2 className='text-xl'>LLM Vocabulary Book</h2>
				<Setting />
			</div>
			
			{showApiKeyAlert && (
				<Paper elevation={2} className='m-4'>
					<Alert 
						severity="warning" 
						className='mb-4'
					>
						You need to set up your OpenAI API key to generate vocabulary explanations. Please click "Edit Setting" to add your key.
					</Alert>
				</Paper>
			)}
			
			<div className='flex flex-grow'>
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
		</div>
	)
}
