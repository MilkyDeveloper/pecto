import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import terser from '@rollup/plugin-terser'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			injectRegister: 'auto',
			registerType: 'autoUpdate',
			manifest: {
				short_name: 'Pecto',
				name: 'Pecto - Procedural Studying Tool',
				icons: [
					{ src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
					{ src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
					{
						src: '/maskable_icon.png',
						type: 'image/png',
						sizes: '1024x1024',
						purpose: 'maskable',
					},
				],
				start_url: '.',
				display: 'standalone',
				theme_color: '#ffffff',
				background_color: '#ffffff',
			},
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			_bs: fileURLToPath(new URL('./node_modules/bootstrap/scss', import.meta.url)),
		},
	},
	server: {
		host: true,
	},
	// build: {
	rollupOptions: {
		// output: {
		// 	manualChunks: {},
		// },
		plugins: [terser()],
	},
})
