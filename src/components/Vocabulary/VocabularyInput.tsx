import AddIcon from '@mui/icons-material/Add'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'

interface IVocabularyInputProps {
	onSubmit: (text: string) => void
}

export default function VocabularyInput({
	onSubmit
}: IVocabularyInputProps): ReactElement {
	const [text, setText] = useState('')

	const handleTextChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setText(event.target.value)
		},
		[]
	)

	const handleSubmit = useCallback(() => {
		if (text.trim()) {
			onSubmit(text.toLowerCase().trim())
			setText('')
		}
	}, [onSubmit, text])

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'Enter') {
				handleSubmit()
			}
		},
		[handleSubmit]
	)

	return (
		<TextField
			fullWidth
			size='small'
			placeholder='Add new word...'
			value={text}
			onChange={handleTextChange}
			onKeyDown={handleKeyDown}
			InputProps={{
				endAdornment: (
					<InputAdornment position='end'>
						<IconButton
							edge='end'
							onClick={handleSubmit}
							disabled={!text.trim()}
							size='small'
							className='p-1 md:p-2'
						>
							<AddIcon />
						</IconButton>
					</InputAdornment>
				)
			}}
			sx={{
				'& .MuiInputBase-root': {
					borderRadius: '8px'
				}
			}}
		/>
	)
}
