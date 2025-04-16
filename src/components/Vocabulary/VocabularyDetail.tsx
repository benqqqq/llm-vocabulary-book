import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import {
	Alert,
	CircularProgress,
	IconButton,
	Paper,
	Tooltip
} from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { useOpenAI } from '../../services/OpenAiContext'
import { useSettingContext } from '../../services/SettingContext'
import type { IVocabulary } from './types'

interface IVocabularyDetailProps {
	vocabulary: IVocabulary | undefined
	onDetailGenerated: (detail: string) => void
	onBackToList?: () => void
}

const GPT_TEMPERATURE = 1

const systemPrompt = `Suppose you are an English teacher with a specialization in vocabulary instruction. A user will provide you with a word, enclosed in triple hash signs. Your job is to thoroughly explain this vocabulary word. Please include the following details in your explanation:

The pronunciation of the word in the International Phonetic Alphabet (IPA) for American English.
The etymology or history of the word, including its roots and how its usage has evolved over time.
The translation of the word into Mandarin Chinese (Taiwan).
Example sentences demonstrating how the word is used in various contexts.
A list of vocabulary words that are similar in meaning or usage, along with a brief explanation of when it is appropriate to use each word.
In addition, feel free to include any other information you believe will be useful for someone trying to learn and understand this vocabulary word. Be sure to organize this information in a clear and appealing way, using markdown formatting to enhance its readability.
Do not include any conversational text and don't need to include the vocabulary title in the beginning.
`

function VocabularyDetail(props: IVocabularyDetailProps): ReactElement {
	const { vocabulary, onDetailGenerated, onBackToList } = props
	const openai = useOpenAI()
	const { setting } = useSettingContext()
	const [isLoading, setIsLoading] = useState(false)
	const [detail, setDetail] = useState('')
	const [error, setError] = useState<string>()
	const [isPlaying, setIsPlaying] = useState(false)
	const finishEvent = useMemo(() => new CustomEvent('finishEvent'), [])

	const handlePronounce = useCallback(() => {
		if (!vocabulary || isPlaying) return

		setIsPlaying(true)
		const utterance = new SpeechSynthesisUtterance(vocabulary.word)

		// Try to find a more natural-sounding voice
		const voices = window.speechSynthesis.getVoices()
		const naturalVoice = voices.find(
			voice => voice.lang === 'en-US' && voice.name.includes('Natural')
		)

		if (naturalVoice) {
			utterance.voice = naturalVoice
		}

		utterance.lang = 'en-US'
		utterance.onend = (): void => setIsPlaying(false)

		// Use addEventListener instead of onerror
		utterance.addEventListener('error', (): void => setIsPlaying(false))

		window.speechSynthesis.speak(utterance)
	}, [vocabulary, isPlaying])

	const handleBackClick = useCallback(() => {
		if (onBackToList) {
			onBackToList()
		}
	}, [onBackToList])

	useEffect(() => {
		if (!vocabulary) {
			return
		}

		if (vocabulary.detail) {
			setDetail(vocabulary.detail)
			setError('')
			return
		}

		// Check for API key
		if (!setting.openaiApiKey) {
			setError('OpenAI API key is missing. Please set it in the settings.')
			return
		}

		const submit = async (): Promise<void> => {
			setIsLoading(true)
			setDetail('')
			setError('')
			try {
				await openai.chatCompletion({
					messages: [
						{
							role: 'system',
							content: systemPrompt
						},
						{
							role: 'user',
							content: `###${vocabulary.word}###`
						}
					],
					model: 'gpt-4.1-nano',
					onContent: (content: string): void => {
						setDetail(previousDetail => previousDetail + content)
					},
					onFinish: (): void => {
						setIsLoading(false)
						document.dispatchEvent(finishEvent)
					},
					temperature: GPT_TEMPERATURE
				})
			} catch (error_) {
				const errorMessage = (error_ as Error).message
				setDetail('')
				setError(errorMessage)
				setIsLoading(false)
			}
		}

		void submit()
	}, [finishEvent, openai, vocabulary, setting.openaiApiKey])

	useEffect(() => {
		const listener = (): void => {
			if (vocabulary && detail && !error) {
				onDetailGenerated(detail)
			}
		}
		document.addEventListener('finishEvent', listener)

		return () => {
			document.removeEventListener('finishEvent', listener)
		}
	}, [detail, finishEvent, onDetailGenerated, vocabulary, error])

	if (!vocabulary) {
		return (
			<div className='flex h-full items-center justify-center text-gray-500'>
				Select a word from the list to view its details
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			<div className='mb-2 flex items-center md:hidden'>
				<IconButton
					onClick={handleBackClick}
					size='small'
					className='text-gray-600'
					aria-label='Back to list'
				>
					<ArrowBackIcon />
				</IconButton>
				<span className='ml-1 text-sm text-gray-600'>Back to list</span>
			</div>
			<Paper elevation={0} className='bg-gray-50 p-4 md:p-6'>
				<div className='mb-2 flex items-center gap-2'>
					<h2 className='m-0 text-2xl font-bold text-gray-900 md:text-3xl'>
						{vocabulary.word}
					</h2>
					<Tooltip title='Listen to pronunciation'>
						<IconButton
							onClick={handlePronounce}
							disabled={isPlaying}
							size='small'
							className='text-gray-600 hover:text-gray-900'
						>
							<VolumeUpIcon />
						</IconButton>
					</Tooltip>
				</div>
				{isLoading ? (
					<div className='flex items-center gap-2 text-gray-600'>
						<CircularProgress size={16} />
						<span>Generating detailed explanation...</span>
					</div>
				) : undefined}
			</Paper>

			{error ? (
				<Alert severity='error' variant='outlined' className='bg-white'>
					{error}
				</Alert>
			) : undefined}

			{detail ? (
				<Paper elevation={0} className='p-4 md:p-6'>
					<div className='prose prose-sm prose-gray max-w-none overflow-x-auto md:prose-base'>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{detail}</ReactMarkdown>
					</div>
				</Paper>
			) : undefined}
		</div>
	)
}

VocabularyDetail.defaultProps = {
	onBackToList: undefined
}

export default VocabularyDetail
