import type { ReactElement } from 'react'
import { useCallback, useMemo } from 'react'
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import type { IVocabulary } from './types'
import DeleteIcon from '@mui/icons-material/Delete'

interface IVocabularyListProps {
	vocabularyList: IVocabulary[]
	onVocabularyClick: (vocabulary: IVocabulary) => void
	onVocabularyDeleteClick: (vocabulary: IVocabulary) => void
}

export default function VocabularyList({
	vocabularyList,
	onVocabularyClick,
	onVocabularyDeleteClick
}: IVocabularyListProps): ReactElement {
	const handleDeleteClick = useCallback(
		(vocabulary: IVocabulary) => (event: React.MouseEvent) => {
			event.stopPropagation()
			onVocabularyDeleteClick(vocabulary)
		},
		[onVocabularyDeleteClick]
	)

	const handleVocabularyClick = useCallback(
		(vocabulary: IVocabulary) => () => {
			onVocabularyClick(vocabulary)
		},
		[onVocabularyClick]
	)

	// create a sorted vocabularyList that order by timestamp
	const sortedVocabularyList = useMemo(
		() =>
			[...vocabularyList].sort(
				(a, b) => b.timestamp.getTime() - a.timestamp.getTime()
			),
		[vocabularyList]
	)
	return (
		<div>
			<h3>VocabularyList</h3>

			<List>
				{sortedVocabularyList.map(item => (
					<ListItemButton
						key={item.id}
						onClick={handleVocabularyClick(item)}
						className='group'
					>
						<ListItemText
							primary={item.word}
							secondary={item.timestamp.toLocaleDateString()}
						/>
						<ListItemIcon
							onClick={handleDeleteClick(item)}
							className='hidden hover:text-red-500 group-hover:block'
						>
							<DeleteIcon />
						</ListItemIcon>
					</ListItemButton>
				))}
			</List>
		</div>
	)
}
