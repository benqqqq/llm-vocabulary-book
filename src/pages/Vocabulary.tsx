import { Alert, Tab, Tabs } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import VocabularyDetail from '../components/Vocabulary/VocabularyDetail'
import VocabularyInput from '../components/Vocabulary/VocabularyInput'
import VocabularyList from '../components/Vocabulary/VocabularyList'
import VocabularyReview from '../components/Vocabulary/VocabularyReview'
import type { IVocabulary } from '../components/Vocabulary/types'
import InstallPwa from '../components/common/InstallPwa'
import Setting from '../components/common/Setting'
import { useSettingContext } from '../services/SettingContext'
import { database } from '../storage/database'

const MOBILE_BREAKPOINT = 768

export default function Vocabulary(): ReactElement {
	const [vocabularyList, setVocabularyList] = useState<IVocabulary[]>([])
	const [selectedVocabulary, setSelectedVocabulary] = useState<IVocabulary>()
	const [showApiKeyAlert, setShowApiKeyAlert] = useState(false)
	const [showMobileDetail, setShowMobileDetail] = useState(false)
	const [activeTab, setActiveTab] = useState<'review' | 'vocabulary'>(
		'vocabulary'
	)
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
					setActiveTab('vocabulary')

					// Show detail view and scroll to top on mobile
					if (window.innerWidth < MOBILE_BREAKPOINT) {
						setShowMobileDetail(true)
						setTimeout(() => {
							window.scrollTo({ top: 0, behavior: 'smooth' })
						}, 100)
					}
				} else {
					const newVocabularyData = {
						word: text,
						archived: false,
						timestamp: new Date(),
						reviewCount: 0
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
					setActiveTab('vocabulary')

					// Show detail view and scroll to top on mobile
					if (window.innerWidth < MOBILE_BREAKPOINT) {
						setShowMobileDetail(true)
						setTimeout(() => {
							window.scrollTo({ top: 0, behavior: 'smooth' })
						}, 100)
					}
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
		setActiveTab('vocabulary')

		// On mobile, set the detail view as visible and scroll to it
		if (window.innerWidth < MOBILE_BREAKPOINT) {
			setShowMobileDetail(true)
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' })
			}, 100)
		}
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

	// Add a function to handle mobile navigation back to the list
	const handleBackToList = useCallback(() => {
		// On mobile, hide the detail view
		setShowMobileDetail(false)
	}, [])

	// Add a function to handle tab changes
	const handleTabChange = useCallback(
		(_event: React.SyntheticEvent, newValue: 'review' | 'vocabulary') => {
			setActiveTab(newValue)
		},
		[]
	)

	// Handle vocabulary selection from review
	const handleVocabularySelectFromReview = useCallback(
		(id: number): void => {
			const vocabulary = vocabularyList.find(item => item.id === id)
			if (vocabulary) {
				setSelectedVocabulary(vocabulary)
				setActiveTab('vocabulary')

				// On mobile, set the detail view as visible and scroll to it
				if (window.innerWidth < MOBILE_BREAKPOINT) {
					setShowMobileDetail(true)
					setTimeout(() => {
						window.scrollTo({ top: 0, behavior: 'smooth' })
					}, 100)
				}
			}
		},
		[vocabularyList]
	)

	// Update a vocabulary's review count when it's used in a review
	const handleVocabularyReviewed = useCallback(
		(reviewedIds: number[]): void => {
			// Update reviewCount in the database and state
			const updateReviewCount = async (): Promise<void> => {
				// Process all updates in parallel instead of sequentially
				await Promise.all(
					reviewedIds.map(async id => {
						const vocabulary = vocabularyList.find(v => v.id === id)
						if (vocabulary) {
							const currentCount = vocabulary.reviewCount ?? 0
							await database.vocabulary.update(id, {
								reviewCount: currentCount + 1
							})
						}
					})
				)

				// Update the state
				setVocabularyList(previousList =>
					previousList.map(item => {
						if (reviewedIds.includes(item.id)) {
							return {
								...item,
								reviewCount: (item.reviewCount ?? 0) + 1
							}
						}
						return item
					})
				)
			}

			void updateReviewCount()
		},
		[vocabularyList]
	)

	return (
		<div className='flex h-screen flex-col bg-gray-50'>
			<div className='flex items-center justify-between border-b bg-white p-4 shadow-sm'>
				<div className='flex items-center gap-2'>
					<h1 className='text-xl font-bold text-gray-800 md:text-2xl'>
						LLM Vocabulary Book
					</h1>
					<span className='rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 md:text-sm'>
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

			<div className='border-b bg-white'>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					className='px-4'
					indicatorColor='primary'
					textColor='primary'
					centered
				>
					<Tab label='Vocabulary' value='vocabulary' />
					<Tab label='Review' value='review' />
				</Tabs>
			</div>

			{activeTab === 'vocabulary' ? (
				<div className='flex flex-grow flex-col overflow-hidden md:flex-row'>
					<div
						className={`h-auto w-full overflow-y-auto border-b bg-white md:h-auto md:w-[300px] md:border-b-0 md:border-r ${
							showMobileDetail ? 'hidden md:block' : 'max-h-[50vh]'
						}`}
					>
						<div className='sticky top-0 z-10 border-b bg-white p-4'>
							<VocabularyInput onSubmit={handleInputSubmit} />
						</div>
						<VocabularyList
							vocabularyList={vocabularyList}
							onVocabularyClick={handleVocabularyClick}
							onVocabularyDeleteClick={handleVocabularyDeleteClick}
						/>
					</div>
					<div
						className={`flex-grow overflow-y-auto bg-white ${
							showMobileDetail ? 'block' : 'hidden md:block'
						}`}
					>
						<div className='mx-auto max-w-3xl p-4 md:p-6'>
							{selectedVocabulary ? (
								<VocabularyDetail
									vocabulary={selectedVocabulary}
									onDetailGenerated={handleDetailGenerated}
									onBackToList={handleBackToList}
								/>
							) : (
								<div className='flex h-full items-center justify-center text-gray-500'>
									Select a word from the list to view its details
								</div>
							)}
						</div>
					</div>
				</div>
			) : (
				<div className='flex-grow overflow-y-auto bg-white p-4 md:p-6'>
					<div className='mx-auto max-w-3xl'>
						<VocabularyReview
							vocabularyList={vocabularyList}
							onVocabularySelect={handleVocabularySelectFromReview}
							onVocabularyReviewed={handleVocabularyReviewed}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
