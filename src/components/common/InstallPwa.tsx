import GetAppIcon from '@mui/icons-material/GetApp'
import { Button, Tooltip } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'

// Define types for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[]
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed'
		platform: string
	}>
	prompt: () => Promise<void>
}

export default function InstallPwa(): ReactElement | null {
	const [supportsPWA, setSupportsPWA] = useState(false)
	const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent>()

	useEffect(() => {
		const handler = (event: Event): void => {
			event.preventDefault()
			setSupportsPWA(true)
			setPromptInstall(event as BeforeInstallPromptEvent)
		}

		window.addEventListener('beforeinstallprompt', handler)

		return () => {
			window.removeEventListener('beforeinstallprompt', handler)
		}
	}, [])

	// Also check if it's already installed
	useEffect(() => {
		if (window.matchMedia('(display-mode: standalone)').matches) {
			setSupportsPWA(false) // Hide the install button if already installed
		}
	}, [])

	const handleClick = useCallback(async (): Promise<void> => {
		if (!promptInstall) {
			return
		}

		void promptInstall.prompt()

		const { outcome } = await promptInstall.userChoice

		if (outcome === 'accepted') {
			setSupportsPWA(false)
		}
	}, [promptInstall])

	if (!supportsPWA) {
		return null
	}

	return (
		<Tooltip title='Install App'>
			<Button
				onClick={handleClick}
				startIcon={<GetAppIcon />}
				variant='outlined'
				size='small'
			>
				Install
			</Button>
		</Tooltip>
	)
}
