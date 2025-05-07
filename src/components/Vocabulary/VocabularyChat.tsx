import {
	Box,
	Button,
	CircularProgress,
	Paper,
	TextField,
	Typography
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useOpenAI } from '../../services/OpenAiContext'
import { useSettingContext } from '../../services/SettingContext'
import type { IVocabulary } from './types'

interface IVocabularyChatProps {
	vocabulary: IVocabulary
}

interface ChatMessage {
	role: 'assistant' | 'system' | 'user'
	content: string
	id: string
}

function VocabularyChat({ vocabulary }: IVocabularyChatProps): JSX.Element {
	const { setting } = useSettingContext()
	const openai = useOpenAI()
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [inputValue, setInputValue] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [streamingMessage, setStreamingMessage] = useState('')
	const streamingContentRef = useRef('')

	// Initialize with system message whenever vocabulary changes
	useEffect(() => {
		setMessages([
			{
				role: 'system',
				content: `You are a helpful English tutor assisting with the vocabulary word "${
					vocabulary.word
				}". 
Use the following detailed information about the word to answer questions:
${vocabulary.detail ?? 'No additional details available yet.'}`,
				id: `system-${Date.now()}`
			}
		])
	}, [vocabulary])

	const handleSubmit = async (event: React.FormEvent): Promise<void> => {
		event.preventDefault()
		if (!inputValue.trim() || isLoading || !setting.openaiApiKey) return

		const userMessage = {
			role: 'user' as const,
			content: inputValue,
			id: `user-${Date.now()}`
		}

		setMessages(previous => [...previous, userMessage])
		setInputValue('')
		setIsLoading(true)
		setStreamingMessage('')
		streamingContentRef.current = '' // Reset ref content

		try {
			await openai.chatCompletion({
				messages: [...messages, userMessage],
				model: 'gpt-4.1-nano',
				onContent: (content: string) => {
					streamingContentRef.current += content // Update ref directly
					setStreamingMessage(streamingContentRef.current) // Update state from ref
				},
				onFinish: () => {
					// Use the ref value which will have the complete content
					const completeContent = streamingContentRef.current

					setMessages(previous => [
						...previous,
						{
							role: 'assistant',
							content: completeContent,
							id: `assistant-${Date.now()}`
						}
					])
					setStreamingMessage('')
					setIsLoading(false)
				},
				temperature: 1
			})
		} catch {
			// Handle errors without logging to console
			setStreamingMessage('Error: Failed to get response. Please try again.')
			setIsLoading(false)
		}
	}

	const handleInputChange = (
		event: React.ChangeEvent<HTMLInputElement>
	): void => {
		setInputValue(event.target.value)
	}

	return (
		<Paper
			elevation={0}
			className='mt-4 rounded-lg p-4 md:p-6'
			sx={{ backgroundColor: 'background.default' }}
		>
			<Typography variant='h6' component='h3' className='mb-4'>
				Chat about &quot;{vocabulary.word}&quot;
			</Typography>

			<div className='flex h-[400px] flex-col'>
				<div className='mb-4 flex-1 space-y-4 overflow-y-auto'>
					{/* Display chat messages */}
					{messages.slice(1).map(message => (
						<div
							key={message.id}
							className={`rounded-lg p-3 ${
								message.role === 'user'
									? 'ml-auto max-w-[80%] bg-blue-100'
									: 'max-w-[80%] bg-gray-100'
							}`}
						>
							<div className='prose prose-sm prose-gray max-w-none overflow-x-auto'>
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{message.content}
								</ReactMarkdown>
							</div>
						</div>
					))}

					{/* Streaming response */}
					{streamingMessage ? (
						<div className='max-w-[80%] rounded-lg bg-gray-100 p-3'>
							<div className='prose prose-sm prose-gray max-w-none overflow-x-auto'>
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{streamingMessage}
								</ReactMarkdown>
							</div>
						</div>
					) : null}

					{/* Loading indicator */}
					{isLoading && !streamingMessage ? (
						<Box className='flex justify-center'>
							<CircularProgress size={24} />
						</Box>
					) : null}
				</div>

				{/* Chat input */}
				<form onSubmit={handleSubmit} className='mt-auto flex gap-2'>
					<TextField
						fullWidth
						variant='outlined'
						placeholder={`Ask about "${vocabulary.word}"...`}
						value={inputValue}
						onChange={handleInputChange}
						disabled={isLoading || !setting.openaiApiKey}
						size='small'
					/>
					<Button
						type='submit'
						variant='contained'
						disabled={isLoading || !inputValue.trim() || !setting.openaiApiKey}
					>
						Send
					</Button>
				</form>

				{!setting.openaiApiKey && (
					<Typography variant='caption' color='error' className='mt-2'>
						OpenAI API key is required. Please set it in the settings.
					</Typography>
				)}
			</div>
		</Paper>
	)
}

export default VocabularyChat
