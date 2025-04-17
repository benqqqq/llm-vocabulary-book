import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import {
	Alert,
	ButtonBase,
	CircularProgress,
	IconButton,
	Paper,
	Tooltip,
	Typography
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

const systemPrompt = `
Suppose you are an English teacher with a specialization in vocabulary instruction, designing lessons for learners whose main language is Traditional Chinese (zh-TW). A user will provide you with a word, enclosed in triple hash signs. Your job is to thoroughly explain this vocabulary word in a way that helps them understand and remember it. Include the following details:

- The pronunciation of the word in the International Phonetic Alphabet (IPA) for American English.
- The etymology or history of the word, linking it to a story or context to aid memory.
- The translation of the word into Mandarin Chinese (Taiwan), with nuances explained if applicable.
- Example sentences showing the word in varied contexts, including one relatable to Taiwanese culture or experiences.
- A list of similar words with brief explanations of their differences and appropriate usage.
- Common collocations or phrases where the word frequently appears.
- A reflective question or mnemonic tip to help the learner connect with or recall the word.

Feel free to add any other details that enhance understanding or retention, keeping the explanation engaging and relevant to zh-TW speakers. Use markdown formatting to organize the information clearly and attractively.

Do not include any conversational text before or after the explanation, and don't include the vocabulary title at the beginning.
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
			<ButtonBase
				className='sticky top-0 z-10 mb-2 flex w-full items-center justify-start bg-white py-2 shadow-sm md:hidden'
				onClick={handleBackClick}
			>
				<IconButton size='small' aria-label='Back to list' color='primary'>
					<ArrowBackIcon />
				</IconButton>
				<span className='ml-1 text-sm text-gray-600'>Back to list</span>
			</ButtonBase>
			<Paper
				elevation={0}
				sx={{
					backgroundColor: 'background.paper'
				}}
				className='rounded-lg p-4 md:p-6'
			>
				<div className='mb-2 flex items-center gap-2'>
					<Typography
						variant='h4'
						component='h2'
						color='primary'
						sx={{ fontWeight: 'bold' }}
					>
						{vocabulary.word}
					</Typography>
					<Tooltip title='Listen to pronunciation'>
						<IconButton
							onClick={handlePronounce}
							disabled={isPlaying}
							size='small'
							color='secondary'
						>
							<VolumeUpIcon />
						</IconButton>
					</Tooltip>
				</div>
				{isLoading ? (
					<div className='flex items-center gap-2 text-gray-600'>
						<CircularProgress size={16} color='primary' />
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
				<Paper
					elevation={0}
					className='rounded-lg p-4 md:p-6'
					sx={{
						backgroundColor: 'background.default'
					}}
				>
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
