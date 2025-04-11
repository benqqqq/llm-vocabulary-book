/// <reference types="vitest" />
import eslintPlugin from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => ({
	test: {
		css: false,
		include: ['src/**/__tests__/*'],
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests.ts',
		clearMocks: true,
		coverage: {
			provider: 'istanbul',
			enabled: true,
			'100': true,
			reporter: ['text', 'lcov'],
			reportsDirectory: 'coverage'
		}
	},
	plugins: [
		tsconfigPaths(),
		react(),
		...(mode === 'test'
			? []
			: [
					eslintPlugin(),
					VitePWA({
						registerType: 'autoUpdate',
						includeAssets: [
							'favicon.png',
							'robots.txt',
							'apple-touch-icon.png',
							'icons/*.svg',
							'fonts/*.woff2'
						],
						manifest: {
							name: "LLM Vocabulary Book",
							short_name: "Vocab Book",
							description: "A vocabulary learning app powered by AI",
							theme_color: '#BD34FE',
							background_color: '#ffffff',
							display: 'standalone',
							start_url: '/',
							icons: [
								{
									src: '/android-chrome-192x192.png',
									sizes: '192x192',
									type: 'image/png',
									purpose: 'any maskable'
								},
								{
									src: '/android-chrome-512x512.png',
									sizes: '512x512',
									type: 'image/png'
								}
							]
						},
						workbox: {
							globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
							runtimeCaching: [
								{
									urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
									handler: 'CacheFirst',
									options: {
										cacheName: 'google-fonts-cache',
										expiration: {
											maxEntries: 10,
											maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
										},
										cacheableResponse: {
											statuses: [0, 200]
										}
									}
								},
								{
									urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
									handler: 'CacheFirst',
									options: {
										cacheName: 'gstatic-fonts-cache',
										expiration: {
											maxEntries: 10,
											maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
										},
										cacheableResponse: {
											statuses: [0, 200]
										}
									}
								},
								{
									urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/i,
									handler: 'CacheFirst',
									options: {
										cacheName: 'images-cache',
										expiration: {
											maxEntries: 50,
											maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
										}
									}
								},
								{
									urlPattern: /^https:\/\/api\.openai\.com\/v1\/chat\/completions/i,
									handler: 'NetworkFirst',
									options: {
										cacheName: 'api-cache',
										expiration: {
											maxEntries: 100,
											maxAgeSeconds: 60 * 60 * 24 // 24 hours
										},
										cacheableResponse: {
											statuses: [0, 200]
										}
									}
								}
							]
						}
					})
			  ])
	],
	resolve: {
		alias: {
			'property-information/html': 'property-information',
			'property-information/find': 'property-information',
			'property-information/normalize': 'property-information'
		}
	},
	optimizeDeps: {
		exclude: ['p-limit']
	}
}))
