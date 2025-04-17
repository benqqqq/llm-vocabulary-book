import { createTheme } from '@mui/material/styles'

// Define theme colors as constants for easy reference and updating
export const THEME_COLORS = {
	primaryMain: '#556B2F', // Dark Olive Green
	secondaryMain: '#8B4513', // Saddle Brown
	white: '#FFFFFF', // White
	backgroundPaper: '#F5F5F5',
	border: '#E0E0E0',
	text: {
		primary: '#556B2F',
		secondary: '#8B4513',
		light: '#6B6B6B'
	},
	hover: {
		primary: 'rgba(85, 107, 47, 0.04)',
		secondary: 'rgba(139, 69, 19, 0.04)'
	}
}

// Create a custom theme with our specified colors
const theme = createTheme({
	palette: {
		primary: {
			main: THEME_COLORS.primaryMain
		},
		secondary: {
			main: THEME_COLORS.secondaryMain
		},
		background: {
			default: THEME_COLORS.white,
			paper: THEME_COLORS.backgroundPaper
		},
		text: {
			primary: THEME_COLORS.text.primary,
			secondary: THEME_COLORS.text.secondary
		}
	},
	typography: {
		h5: {
			fontWeight: 600,
			color: THEME_COLORS.primaryMain
		},
		body1: {
			color: THEME_COLORS.text.primary
		},
		body2: {
			color: THEME_COLORS.text.light
		}
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 4
				},
				containedPrimary: {
					boxShadow: 'none',
					'&:hover': {
						boxShadow: 'none'
					}
				},
				outlinedSecondary: {
					'&:hover': {
						backgroundColor: THEME_COLORS.hover.secondary
					}
				}
			}
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					border: `1px solid ${THEME_COLORS.border}`
				}
			}
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					'&:hover': {
						backgroundColor: THEME_COLORS.hover.primary
					}
				}
			}
		},
		MuiChip: {
			styleOverrides: {
				outlinedPrimary: {
					borderColor: THEME_COLORS.primaryMain
				}
			}
		},
		MuiIconButton: {
			styleOverrides: {
				colorSecondary: {
					color: THEME_COLORS.secondaryMain
				}
			}
		}
	}
})

export default theme
