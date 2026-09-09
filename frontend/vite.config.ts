import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = path.resolve(import.meta.dirname, '..')
  const env = loadEnv(mode, envDir, '')
  const frontendPort = Number(env.VITE_PORT || 5174)
  const backendPort = env.PORT || '3000'
  const backendTarget = env.VITE_PORTFOLIO_API_URL || `http://localhost:${backendPort}`

  return {
    envDir,
    plugins: [react(), tailwindcss()],
    server: {
      port: frontendPort,
      // Vite will try the next available port when the preferred port is busy.
      strictPort: false,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
