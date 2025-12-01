import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import apiServer from './vite-api-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiServer()],
  envDir: './',
  envPrefix: 'VITE_',
})
