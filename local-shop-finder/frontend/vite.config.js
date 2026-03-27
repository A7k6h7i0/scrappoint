import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:5046/api'

  let proxyTarget = 'https://hindu-search.digitalleadpro.com'

  try {
    proxyTarget = new URL(apiBaseUrl).origin
  } catch {
    // Keep the hosted backend as a safe fallback when the env value is relative.
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https://'),
        },
      },
    },
  }
})
