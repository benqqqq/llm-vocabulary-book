import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import { LoadingButton } from '@mui/lab'
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	FormGroup,
	IconButton,
	Link,
	TextField,
	Tooltip,
	Typography
} from '@mui/material'
import type { ChangeEvent, ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
	defaultSettingContext,
	useSettingContext
} from '../../services/SettingContext'

export default function Setting(): ReactElement {
	const settingContext = useSettingContext()
	const [setting, setSetting] = useState(defaultSettingContext.setting)
	const [isShowKey, setIsShowKey] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		setSetting(settingContext.setting)
	}, [settingContext.setting])

	const handleSaveClick = useCallback(async () => {
		const simulateDelayMs = 1000
		await settingContext.storeSetting('openaiApiKey', setting.openaiApiKey, {
			simulateDelayMs
		})
		setIsOpen(false)
	}, [settingContext, setting])

	const handleOnChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setSetting({ ...setting, openaiApiKey: event.target.value })
		},
		[setting]
	)

	const handleShowKeyClick = useCallback(() => {
		setIsShowKey(k => !k)
	}, [])

	const handleOpenDialog = useCallback(() => {
		setIsOpen(true)
	}, [])

	const handleCloseDialog = useCallback(() => {
		setIsOpen(false)
	}, [])

	return (
		<>
			<Tooltip title="Open Settings">
				<Button 
					onClick={handleOpenDialog} 
					startIcon={<SettingsIcon />}
					variant="outlined"
					size="small"
				>
					Settings
				</Button>
			</Tooltip>

			<Dialog open={isOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle>
					Application Settings
				</DialogTitle>
				<DialogContent>
					<div className="mb-4">
						<Typography variant="body2" className="mb-2">
							To use this application, you need an OpenAI API key.
							<Tooltip title="You can get an API key from OpenAI's website">
								<IconButton size="small" href="https://platform.openai.com/api-keys" target="_blank">
									<HelpOutlineIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</Typography>
						<Typography variant="body2" className="mb-4">
							Don't have a key? <Link href="https://platform.openai.com/signup" target="_blank">Sign up at OpenAI</Link> to get one.
						</Typography>
					</div>
					
					<TextField
						label="OpenAI API Key"
						variant="outlined"
						fullWidth
						value={setting.openaiApiKey}
						onChange={handleOnChange}
						type={isShowKey ? 'text' : 'password'}
						disabled={settingContext.isLoading}
						placeholder="sk-..."
						helperText="Your API key will be stored locally and never sent to any server other than OpenAI."
					/>
					
					<FormGroup className="mt-2">
						<FormControlLabel
							control={
								<Checkbox checked={isShowKey} onChange={handleShowKeyClick} />
							}
							label="Show API key"
						/>
					</FormGroup>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<LoadingButton
						variant="contained"
						color="primary"
						onClick={handleSaveClick}
						loading={settingContext.isLoading}
						loadingIndicator="Saving..."
					>
						Save
					</LoadingButton>
				</DialogActions>
			</Dialog>
		</>
	)
}
