import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DeleteIcon from '@mui/icons-material/Delete'
import { IconButton, List, ListItemButton, ListItemText, Tooltip } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useMemo } from 'react'
import type { IVocabulary } from './types'

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

	const formatDate = (date: Date): string => {
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const days = Math.floor(diff / (1000 * 60 * 60 * 24))
		
		if (days === 0) {
			return 'Today'
		} else if (days === 1) {
			return 'Yesterday'
		} else if (days < 7) {
			return `${days} days ago`
		} else {
			return date.toLocaleDateString()
		}
	}

	return (
		<List className="py-0">
			{sortedVocabularyList.map(item => (
				<ListItemButton
					key={item.id}
					onClick={handleVocabularyClick(item)}
					className='group hover:bg-gray-50'
				>
					<div className="flex flex-col flex-grow py-1">
						<ListItemText
							primary={
								<span className="font-medium text-gray-900">
									{item.word}
								</span>
							}
							secondary={
								<div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
									<AccessTimeIcon sx={{ fontSize: 14 }} />
									{formatDate(item.timestamp)}
								</div>
							}
							className="my-0"
						/>
					</div>
					<Tooltip title="Delete word">
						<IconButton
							onClick={handleDeleteClick(item)}
							className='opacity-0 group-hover:opacity-100'
							size="small"
							color="error"
						>
							<DeleteIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</ListItemButton>
			))}
		</List>
	)
}
