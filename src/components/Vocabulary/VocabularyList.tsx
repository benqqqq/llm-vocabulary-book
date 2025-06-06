import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DeleteIcon from '@mui/icons-material/Delete'
import SchoolIcon from '@mui/icons-material/School'
import {
	Chip,
	IconButton,
	List,
	ListItemButton,
	Tooltip,
	Typography
} from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useMemo } from 'react'
import type { IVocabulary } from './types'

// Constants to replace magic numbers
const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_WEEK = 7
const ONE_DAY = 1
const ICON_SIZE_MULTIPLIER = 2

// Move formatDate to outer scope
const formatDate = (date: Date): string => {
	const now = new Date()
	const diff = now.getTime() - date.getTime()
	const days = Math.floor(
		diff /
			(MILLISECONDS_PER_SECOND *
				SECONDS_PER_MINUTE *
				MINUTES_PER_HOUR *
				HOURS_PER_DAY)
	)

	if (days === 0) {
		return 'Today'
	}

	if (days === ONE_DAY) {
		return 'Yesterday'
	}

	if (days < DAYS_PER_WEEK) {
		return `${days} days ago`
	}

	return date.toLocaleDateString()
}

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
		<List className='py-0'>
			{sortedVocabularyList.map(item => (
				<ListItemButton
					key={item.id}
					onClick={handleVocabularyClick(item)}
					className='group'
				>
					<div className='flex flex-grow flex-col py-1'>
						<div className='flex items-center justify-between'>
							<Typography
								variant='body1'
								className='font-medium'
								color='primary'
							>
								{item.word}
							</Typography>
							<div className='flex items-center'>
								{item.reviewCount ? (
									<Tooltip title='Review count'>
										<Chip
											icon={<SchoolIcon fontSize='small' />}
											label={item.reviewCount}
											size='small'
											className='ml-2'
											color='primary'
											variant='outlined'
										/>
									</Tooltip>
								) : null}
								<Tooltip title='Delete word'>
									<IconButton
										onClick={handleDeleteClick(item)}
										className='opacity-100 md:opacity-0 md:group-hover:opacity-100'
										size='small'
										color='error'
									>
										<DeleteIcon fontSize='small' />
									</IconButton>
								</Tooltip>
							</div>
						</div>
						<div className='mt-1 flex items-center gap-1 text-xs text-gray-500'>
							<AccessTimeIcon
								color='secondary'
								sx={{ fontSize: DAYS_PER_WEEK * ICON_SIZE_MULTIPLIER }}
							/>
							{formatDate(item.timestamp)}
						</div>
					</div>
				</ListItemButton>
			))}
		</List>
	)
}
