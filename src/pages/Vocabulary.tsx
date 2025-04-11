import { Alert } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import VocabularyDetail from '../components/Vocabulary/VocabularyDetail'
import VocabularyInput from '../components/Vocabulary/VocabularyInput'
import VocabularyList from '../components/Vocabulary/VocabularyList'
import type { IVocabulary } from '../components/Vocabulary/types'
import InstallPwa from '../components/common/InstallPwa'
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
		<div className='flex h-screen flex-col bg-gray-50'>
			<div className='flex items-center justify-between border-b bg-white p-4 shadow-sm'>
				<div className='flex items-center gap-2'>
					<h1 className='text-2xl font-bold text-gray-800'>
						LLM Vocabulary Book
					</h1>
					<span className='rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-500'>
						{vocabularyList.length} words
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<InstallPwa />
					<Setting />
				</div>
			</div>

			{showApiKeyAlert ? (
				<div className='mx-4 mt-4'>
					<Alert severity='warning' variant='outlined' className='bg-white'>
						You need to set up your OpenAI API key to generate vocabulary
						explanations. Please click the Settings button to add your key.
					</Alert>
				</div>
			) : undefined}

			<div className='flex flex-grow overflow-hidden'>
				<div className='w-[300px] overflow-y-auto border-r bg-white'>
					<div className='sticky top-0 z-10 border-b bg-white p-4'>
						<VocabularyInput onSubmit={handleInputSubmit} />
					</div>
					<VocabularyList
						vocabularyList={vocabularyList}
						onVocabularyClick={handleVocabularyClick}
						onVocabularyDeleteClick={handleVocabularyDeleteClick}
					/>
				</div>
				<div className='flex-grow overflow-y-auto bg-white'>
					<div className='mx-auto max-w-3xl p-6'>
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
