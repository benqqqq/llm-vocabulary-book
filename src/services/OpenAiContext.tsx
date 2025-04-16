import { createParser } from 'eventsource-parser'
import type React from 'react'
import type { ReactElement } from 'react'
import { createContext, useContext, useMemo } from 'react'
import type { ISettingContext } from './SettingContext'
import { useSettingContext } from './SettingContext'

interface IOpenAiApi {
	chatCompletion: (options: IChatCompletionOptions) => Promise<void>
}

export const GPT_MODELS = [
	'gpt-3.5-turbo-16k',
	'gpt-3.5-turbo',
	'gpt-4',
	'gpt-4-32k',
	'gpt-4o',
	'gpt-4o-mini',
	'gpt-4.1-nano'
] as const

export interface IChatCompletionOptions {
	messages: IChatCompletionMessage[]
	onContent: (content: string) => void
	onFinish: () => void
	temperature?: number
	model: (typeof GPT_MODELS)[number]
}

interface IChatCompletionData {
	choices: {
		delta: {
			content?: string
		}
	}[]
}

const apiNotReady = async (): Promise<void> => {
	throw new Error('OpenAI API not ready')
}

const defaultOpenAiApi: IOpenAiApi = {
	chatCompletion: apiNotReady
}

export interface IChatCompletionMessage {
	role: 'assistant' | 'system' | 'user'
	content: string
}

const chatCompletion = async (
	apiKey: string,
	{ messages, onContent, onFinish, temperature, model }: IChatCompletionOptions
): Promise<void> => {
	const resp = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			messages,
			temperature,
			stream: true
		})
	})
	const parser = createParser(event => {
		if (event.type === 'event') {
			let data
			try {
				data = JSON.parse(event.data) as IChatCompletionData
			} catch (error) {
				if (event.data === '[DONE]') {
					return
				}
				throw error
			}
			onContent(data.choices[0].delta.content ?? '')
		}
	})
	const SUCCESS = 200
	if (resp.status !== SUCCESS) {
		throw new Error(await resp.text())
	}

	const reader = resp.body?.getReader()
	if (!reader) {
		throw new Error('no reader')
	}
	try {
		// eslint-disable-next-line no-await-in-loop
		let { done, value } = await reader.read()
		while (!done) {
			parser.feed(new TextDecoder().decode(value))
			// eslint-disable-next-line no-await-in-loop
			;({ done, value } = await reader.read())
		}
		onFinish()
	} finally {
		reader.releaseLock()
	}
}

const useOpenAiService = (settingContext: ISettingContext): IOpenAiApi =>
	useMemo(
		() => ({
			chatCompletion: async (options: IChatCompletionOptions) =>
				chatCompletion(settingContext.setting.openaiApiKey, options)
		}),
		[settingContext.setting.openaiApiKey]
	)

// Create the context
const OpenAIContext = createContext<IOpenAiApi>(defaultOpenAiApi)

// Create a provider component
export function OpenAIProvider({
	children
}: {
	children: React.ReactNode
}): ReactElement {
	// Create the OpenAIApi instance
	const settingContext = useSettingContext()
	const openai = useOpenAiService(settingContext)

	return (
		<OpenAIContext.Provider value={openai}>{children}</OpenAIContext.Provider>
	)
}

export function useOpenAI(): IOpenAiApi {
	return useContext(OpenAIContext)
}

export default OpenAIContext
