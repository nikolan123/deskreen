import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'


interface PackageJson {
	version?: string
}

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as PackageJson
const clientViewerVersion = process.env.VITE_CLIENT_VIEWER_VERSION || packageJson.version || ''


// plugin to replace html placeholders with env variables
const replaceHtmlEnvPlugin = (): Plugin => {
	return {
		name: 'replace-html-env',
		transformIndexHtml(html) {
			// We still replace the version placeholder if it's used elsewhere, 
			// but based on index.html it was only used in a meta tag I just removed.
			// However, to be safe and minimal, I'll just return html or keep version if needed.
			// The user said "ABSOLUTELY ALL google analytics".
			// The version might be useful for other things, but the code showed it was used for GA events.
			// Let's just keep the version replacement if it exists in other places, but remove GA stuff.

			const transformed = html
				.replace(/%VITE_CLIENT_VIEWER_VERSION%/g, clientViewerVersion)

			return transformed
		},
	}
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		legacy({
			targets: ['defaults', 'not IE 11'], // Or your specific browser targets
		}),
		nodePolyfills(),
		replaceHtmlEnvPlugin(),
	],
})
