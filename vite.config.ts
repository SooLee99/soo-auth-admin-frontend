import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler', {target: '18', runtimeModule: 'react-compiler-runtime'}]],
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
        proxy: {
            '/static': {
                target: 'https://127.0.0.1:8080/static',
                changeOrigin: true,
                secure: false,
                toProxy: true,
                followRedirects: true,
                rewrite: (path) => path.replace(/^\/static/, ''),
            },
            '/api': {
                target: 'http://127.0.0.1:8080/api',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                ws: true,
            },
        },
    },
})
