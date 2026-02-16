import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { portfolioDevApi } from './plugins/portfolioDevApi'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), portfolioDevApi()],
})
