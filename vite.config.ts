/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import devtoolsJson from 'vite-plugin-devtools-json'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        // https://github.com/ChromeDevTools/vite-plugin-devtools-json
        // Enables Chrome DevTools to auto-connect to the local project folder as a Workspace
        devtoolsJson(),
    ],
    test: {
        include: ['src/**/*.test.ts'],
    },
})
