import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://127.0.0.1:8080'

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            [
              'babel-plugin-react-compiler',
              {
                target: '18',
                runtimeModule: 'react-compiler-runtime',
              },
            ],
          ],
        },
      }),
      compression({
        algorithms: ['gzip', 'brotliCompress'],
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            ui: ['react-icons', 'bootstrap'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/static': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})