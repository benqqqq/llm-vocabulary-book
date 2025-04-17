import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material'
import type React from 'react'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { GPT_MODELS, useOpenAI } from '../../services/OpenAiContext'
import { useSettingContext } from '../../services/SettingContext'
import { database } from '../../storage/database'
import { THEME_COLORS } from '../../theme'
import type { IVocabulary } from './types'

interface IVocabularyReviewProps {
	vocabularyList: IVocabulary[]
	onVocabularySelect: (vocabularyId: number) => void
	onVocabularyReviewed: (reviewedIds: number[]) => void
}

interface CustomLinkProps {
	children: React.ReactNode
	href?: string
	// Using "on" prefix here for consistency with event handler name pattern
	// eslint-disable-next-line react/jsx-handler-names
	onWordClick: (word: string) => void
	[key: string]: unknown
}

// Custom link component for ReactMarkdown
function CustomLink({
	children,
	href = '',
	onWordClick,
	...props
}: CustomLinkProps): ReactElement {
	const handleClick = (event: React.MouseEvent): void => {
		event.preventDefault()
		if (href.startsWith('#word-')) {
			const word = href.replace('#word-', '')
			onWordClick(word)
		}
	}

	if (href.startsWith('#word-')) {
		return (
			<button
				type='button'
				onClick={handleClick}
				className='font-bold transition-colors duration-200 hover:underline'
				style={{
					border: 'none',
					background: 'none',
					padding: '0',
					cursor: 'pointer',
					color: THEME_COLORS.secondaryMain
				}}
				{...props}
			>
				{children}
			</button>
		)
	}
	return (
		<a
			href={href}
			className='hover:underline'
			style={{ color: THEME_COLORS.secondaryMain }}
			{...props}
		>
			{children}
		</a>
	)
}

CustomLink.defaultProps = {
	href: ''
}

const REVIEW_SYSTEM_PROMPT = `
You are an expert English teacher creating personalized review exercises for a language learner.
I'll provide you with a list of vocabulary words the student has learned previously.

Create an engaging review activity that tests the student's knowledge of these words. 
Choose one of the following formats:
1. Cloze test (fill-in-the-blank sentences)
2. Word definition matching
3. Context-based usage questions
4. Word relationships exercise
5. Short story using the vocabulary words

IMPORTANT FORMATTING INSTRUCTIONS:
1. Mix up the order of vocabulary words in your exercise - never present them in the same order as I provided them.
2. Include clear instructions and make the activity interactive.
3. For exercises with specific answers, you MUST include an answers section at the end using this exact format:

---ANSWERS_BEGIN---
Your answer content here
---ANSWERS_END---

The markers must be on their own lines with exactly this format for proper rendering.

Format your response using markdown. 
Create an activity that's appropriate for the number and type of words provided.
If fewer than 3 words are provided, create a simpler activity focusing on those words in depth.
`

// Define custom link renderer outside component
// eslint-disable-next-line react/jsx-handler-names
const customLinkRenderer = (
	handleWordClick: (word: string) => void
): ((props: Record<string, unknown>) => ReactElement) => {
	function LinkRenderer(props: Record<string, unknown>): ReactElement {
		return (
			<CustomLink
				{...(props as CustomLinkProps)}
				onWordClick={handleWordClick}
			/>
		)
	}
	return LinkRenderer
}

// Define a markdown component wrapper outside of the render function
function MarkdownRenderer({
	content,
	// eslint-disable-next-line react/jsx-handler-names
	onWordClick
}: {
	content: string
	// eslint-disable-next-line react/jsx-handler-names
	onWordClick: (word: string) => void
}): ReactElement {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				// eslint-disable-next-line @typescript-eslint/naming-convention
				a: customLinkRenderer(onWordClick)
			}}
		>
			{content}
		</ReactMarkdown>
	)
}

export default function VocabularyReview({
	vocabularyList,
	onVocabularySelect,
	onVocabularyReviewed
}: IVocabularyReviewProps): ReactElement {
	const [isLoading, setIsLoading] = useState(false)
	const [reviewContent, setReviewContent] = useState('')
	const [error, setError] = useState<string>('')
	const [showAnswers, setShowAnswers] = useState(false)
	const openai = useOpenAI()
	const { setting } = useSettingContext()

	// Load the most recent review when component mounts
	useEffect(() => {
		const fetchLatestReview = async (): Promise<void> => {
			try {
				// Get the most recent review from the database
				const reviews = await database.reviews
					.orderBy('timestamp')
					.reverse()
					.limit(1)
					.toArray()

				if (reviews.length > 0) {
					setReviewContent(reviews[0].content)
				}
			} catch (fetchError) {
				console.error('Error fetching latest review:', fetchError)
			}
		}

		void fetchLatestReview()
	}, [])

	const handleGenerateReview = useCallback(async () => {
		if (vocabularyList.length === 0) {
			setError('Please add some vocabulary words first to generate a review.')
			return
		}

		if (!setting.openaiApiKey) {
			setError('OpenAI API key is missing. Please set it in the settings.')
			return
		}

		setIsLoading(true)
		setReviewContent('')
		setError('')
		setShowAnswers(false)

		try {
			// Create a map to track review counts
			const reviewCountGroups = new Map<number, IVocabulary[]>()

			// Organize vocabulary by review count
			for (const vocab of vocabularyList) {
				const reviewCount = vocab.reviewCount ?? 0
				const group = reviewCountGroups.get(reviewCount) ?? []
				group.push(vocab)
				reviewCountGroups.set(reviewCount, group)
			}

			// Get all unique review counts and sort them (lowest first)
			const reviewCounts = [...reviewCountGroups.keys()].sort((a, b) => a - b)

			// Select words starting from groups with lowest review count
			const selectedVocabulary: IVocabulary[] = []
			let remainingSlots = 5 // Take 5 words for review

			for (const count of reviewCounts) {
				if (remainingSlots <= 0) break

				// Get words in this review count group
				const wordsInGroup = reviewCountGroups.get(count) ?? []

				// Create a shuffled copy of the group
				const shuffledWords = [...wordsInGroup]

				// Fisher-Yates shuffle algorithm
				for (
					let indexToShuffle = shuffledWords.length - 1;
					indexToShuffle > 0;
					indexToShuffle -= 1
				) {
					const randomIndex = Math.floor(Math.random() * (indexToShuffle + 1))
					// Swap elements
					const temporary = shuffledWords[indexToShuffle]
					shuffledWords[indexToShuffle] = shuffledWords[randomIndex]
					shuffledWords[randomIndex] = temporary
				}

				// Take words from this group, up to the remaining slots
				const wordsToTake = Math.min(remainingSlots, shuffledWords.length)
				selectedVocabulary.push(...shuffledWords.slice(0, wordsToTake))
				remainingSlots -= wordsToTake
			}

			// Save the selected word IDs for tracking
			const wordIds = selectedVocabulary.map(v => v.id)

			const wordsList = selectedVocabulary.map(v => v.word).join(', ')

			let fullContent = ''

			await openai.chatCompletion({
				messages: [
					{
						role: 'system',
						content: REVIEW_SYSTEM_PROMPT
					},
					{
						role: 'user',
						content: `Create a review exercise using these vocabulary words: ${wordsList}`
					}
				],
				model: GPT_MODELS.includes(
					setting.openaiModel as (typeof GPT_MODELS)[number]
				)
					? (setting.openaiModel as (typeof GPT_MODELS)[number])
					: 'gpt-4.1-nano',
				onContent: (content: string): void => {
					fullContent += content
					setReviewContent(previousContent => previousContent + content)
				},
				onFinish: (): void => {
					setIsLoading(false)

					// Save the review to the database
					const saveReview = async (): Promise<void> => {
						try {
							await database.reviews.add({
								content: fullContent,
								timestamp: new Date(),
								vocabularyIds: wordIds
							})
						} catch (saveError) {
							console.error('Error saving review:', saveError)
						}
					}

					void saveReview()

					// Update review counts when the review is generated
					onVocabularyReviewed(wordIds)
				},
				temperature: 1
			})
		} catch (error_) {
			const errorMessage = (error_ as Error).message
			setError(errorMessage)
			setIsLoading(false)
		}
	}, [
		vocabularyList,
		openai,
		setting.openaiApiKey,
		setting.openaiModel,
		onVocabularyReviewed
	])

	// Function to handle clicking on a word in the review
	const handleWordClick = useCallback(
		(word: string) => {
			const matchingVocabulary = vocabularyList.find(
				v => v.word.toLowerCase() === word.toLowerCase()
			)
			if (matchingVocabulary) {
				onVocabularySelect(matchingVocabulary.id)
			}
		},
		[vocabularyList, onVocabularySelect]
	)

	const handleToggleAnswers = useCallback(() => {
		setShowAnswers(previousValue => !previousValue)
	}, [])

	// Process review content to make vocabulary words clickable
	const processedContent = useMemo(() => {
		if (!reviewContent) return ''

		// Split the content into two parts: main content and answers
		const answersStartMarker = '---ANSWERS_BEGIN---'
		const answersEndMarker = '---ANSWERS_END---'

		// Find the answers section
		const startIndex = reviewContent.indexOf(answersStartMarker)
		const endIndex = reviewContent.indexOf(answersEndMarker)

		let mainContent = reviewContent
		let answers = ''

		// Extract the answers section if it exists
		if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
			mainContent = reviewContent.slice(0, startIndex)
			answers = reviewContent.slice(
				startIndex,
				endIndex + answersEndMarker.length
			)
		}

		// Make vocabulary words clickable in the main content
		for (const vocab of vocabularyList) {
			const regex = new RegExp(`\\b${vocab.word}\\b`, 'gi')
			mainContent = mainContent.replace(
				regex,
				`[${vocab.word}](#word-${vocab.word.toLowerCase()})`
			)
		}

		return showAnswers ? `${mainContent}\n\n${answers}` : mainContent
	}, [reviewContent, vocabularyList, showAnswers])

	return (
		<div className='space-y-4'>
			<Paper
				elevation={0}
				className='rounded-lg p-4 md:p-6'
				sx={{ backgroundColor: 'background.paper' }}
			>
				<Typography
					variant='h5'
					component='h2'
					className='mb-4'
					color='primary'
				>
					Vocabulary Review
				</Typography>

				<Button
					variant='contained'
					color='primary'
					onClick={handleGenerateReview}
					disabled={isLoading || vocabularyList.length === 0}
					fullWidth
					className='mb-4'
				>
					{isLoading ? (
						<span className='flex items-center'>
							<CircularProgress size={16} className='mr-2' /> Generating
							Review...
						</span>
					) : (
						'Generate Review Exercise'
					)}
				</Button>

				{error ? (
					<Typography color='error' className='my-2'>
						{error}
					</Typography>
				) : null}
			</Paper>

			{reviewContent ? (
				<Paper
					elevation={0}
					className='rounded-lg p-4 md:p-6'
					sx={{ backgroundColor: 'background.default' }}
				>
					<div className='prose prose-sm prose-gray max-w-none overflow-x-auto md:prose-base'>
						{/* eslint-disable-next-line react/jsx-handler-names */}
						<MarkdownRenderer
							content={processedContent}
							onWordClick={handleWordClick}
						/>
					</div>

					{reviewContent.includes('---ANSWERS_BEGIN---') && (
						<Box display='flex' justifyContent='center' mt={4}>
							<Button
								variant='outlined'
								color='secondary'
								onClick={handleToggleAnswers}
							>
								{showAnswers ? 'Hide Answers' : 'Show Answers'}
							</Button>
						</Box>
					)}
				</Paper>
			) : null}
		</div>
	)
}
