import type { ReactElement } from 'react'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react'
import { database } from '../storage/database'

interface ISetting {
	openaiApiKey: string
	openaiModel: string
}

export interface ISettingContext {
	setting: ISetting
	isLoading: boolean
	storeSetting: (
		settingKey: keyof ISetting,
		value: string,
		options?: {
			simulateDelayMs?: number
		}
	) => Promise<void>
}

export const defaultSettingContext: ISettingContext = {
	setting: {
		openaiApiKey: '',
		openaiModel: 'gpt-4.1-nano'
	},
	isLoading: false,
	storeSetting: async () => {}
}

const SettingContext = createContext<ISettingContext>(defaultSettingContext)

export function SettingProvider({
	children
}: {
	children: React.ReactNode
}): ReactElement {
	const [setting, setSetting] = useState<ISetting>(
		defaultSettingContext.setting
	)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const getSettingsFromStorage = async (): Promise<void> => {
			setIsLoading(true)
			const credentials = await database.credentials.toArray()
			const settingFromStorage = {} as ISetting
			for (const credential of credentials) {
				settingFromStorage[credential.name as keyof ISetting] = credential.value
			}
			setSetting(settingFromStorage)
			setIsLoading(false)
		}

		void getSettingsFromStorage()
	}, [])

	const storeSetting = useCallback(
		async (
			settingKey: keyof ISetting,
			value: string,
			{ simulateDelayMs = 0 } = {}
		) => {
			setIsLoading(true)
			const startTimeInMs = performance.now()

			const updatedCount = await database.credentials
				.where('name')
				.equals(settingKey)
				.modify(s => {
					// eslint-disable-next-line no-param-reassign
					s.value = value
				})

			if (updatedCount === 0) {
				await database.credentials.add({
					name: settingKey,
					value
				})
			}

			// Update local state immediately after database update
			setSetting(previousSetting => ({
				...previousSetting,
				[settingKey]: value
			}))

			return new Promise<void>(resolve => {
				if (simulateDelayMs > 0) {
					setTimeout(() => {
						setIsLoading(false)
						resolve()
					}, Math.max(0, startTimeInMs + simulateDelayMs - performance.now()))
				} else {
					setIsLoading(false)
					resolve()
				}
			})
		},
		[]
	)

	const settingContext: ISettingContext = useMemo(
		() => ({
			setting,
			isLoading,
			storeSetting
		}),
		[setting, isLoading, storeSetting]
	)

	return (
		<SettingContext.Provider value={settingContext}>
			{children}
		</SettingContext.Provider>
	)
}

export const useSettingContext = (): ISettingContext =>
	useContext(SettingContext)

export default {
	SettingProvider
}
