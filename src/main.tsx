import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from 'App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

// Register service worker with auto-update and refresh prompt
const updateSW = registerSW({
	onNeedRefresh() {
		if (confirm('New content available. Reload to update?')) {
			updateSW()
		}
	},
	onOfflineReady() {
		console.log('App is ready for offline use')
	}
})

const MAX_RETRIES = 1
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Number.POSITIVE_INFINITY,
			retry: MAX_RETRIES
		}
	}
})

const container = document.querySelector('#root')
if (container) {
	const root = createRoot(container)
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</StrictMode>
	)
}
