import type { ReactElement } from 'react'
import { TextField } from '@mui/material'
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
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'Enter') {
				onSubmit(text.toLowerCase())
				setText('')
			}
		},
		[onSubmit, text]
	)
	return (
		<div>
			<h3>VocabularyInput</h3>
			<TextField
				autoFocus
				placeholder='New word'
				value={text}
				onChange={handleTextChange}
				onKeyDown={handleKeyDown}
			/>
		</div>
	)
}
