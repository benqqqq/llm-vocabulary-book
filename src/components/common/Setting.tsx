import type { ChangeEvent, ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
	defaultSettingContext,
	useSettingContext
} from '../../services/SettingContext'
import {
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	TextField
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

export default function Setting(): ReactElement {
	const settingContext = useSettingContext()
	const [setting, setSetting] = useState(defaultSettingContext.setting)
	const [isShowKey, setIsShowKey] = useState(false)
	const [isShow, setIsShow] = useState(false)

	useEffect(() => {
		setSetting(settingContext.setting)
	}, [settingContext.setting])

	const handleSaveClick = useCallback(async () => {
		const simulateDelayMs = 1000
		await settingContext.storeSetting('openaiApiKey', setting.openaiApiKey, {
			simulateDelayMs
		})
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

	const handleEditSettingClick = useCallback(() => {
		setIsShow(true)
	}, [])

	return isShow ? (
		<div className='flex w-96 items-center justify-around'>
			<TextField
				label='OpenAI API Key'
				variant='standard'
				value={setting.openaiApiKey}
				onChange={handleOnChange}
				type={isShowKey ? 'text' : 'password'}
				disabled={settingContext.isLoading}
			/>
			<FormGroup>
				<FormControlLabel
					control={
						<Checkbox checked={isShowKey} onChange={handleShowKeyClick} />
					}
					label='show key'
				/>
			</FormGroup>
			<LoadingButton
				variant='outlined'
				size='small'
				onClick={handleSaveClick}
				loading={settingContext.isLoading}
				loadingIndicator='Saving...'
			>
				Save
			</LoadingButton>
		</div>
	) : (
		<Button onClick={handleEditSettingClick}>Edit Setting</Button>
	)
}
