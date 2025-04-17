import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import LoadingOrError from 'components/common/LoadingOrError'
import type { ReactElement } from 'react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { getConfig } from './config'
import { OpenAIProvider } from './services/OpenAiContext'
import { SettingProvider } from './services/SettingContext'
import theme from './theme'

const VocabularyPage = lazy(async () => import('pages/Vocabulary'))

export default function App(): ReactElement {
	return (
		<ThemeProvider theme={theme}>
			<BrowserRouter basename={getConfig().basename}>
				<CssBaseline />
				<SettingProvider>
					<OpenAIProvider>
						<Suspense fallback={<LoadingOrError />}>
							<Routes>
								<Route path='/*' element={<VocabularyPage />} />
							</Routes>
						</Suspense>
					</OpenAIProvider>
				</SettingProvider>
			</BrowserRouter>
		</ThemeProvider>
	)
}
