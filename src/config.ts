interface Config {
	basename: string
}

export const config: Record<string, Config> = {
	development: {
		basename: ''
	},
	production: {
		basename: '/llm-vocabulary-book'
	},
	test: {
		basename: ''
	}
}

export const getConfig = (): Config => {
	// Use a simple check based on the hostname to determine environment
	const isDevelopment =
		window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1'
	const environment = isDevelopment ? 'development' : 'production'
	return config[environment]
}
