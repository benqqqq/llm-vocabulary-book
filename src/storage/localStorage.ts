interface ILocalStorageAdaptor {
	get: () => string | null
	set: (value: unknown) => void
}

export default function getLocalStorage(key: string): ILocalStorageAdaptor {
	return {
		get: (): string | null => {
			const item = localStorage.getItem(key)
			return item && (JSON.parse(item) as string)
		},
		set: (value: unknown): void => {
			localStorage.setItem(key, JSON.stringify(value))
		}
	}
}
