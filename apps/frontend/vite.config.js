import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// Optional HTTPS config via mkcert (place certs in project root or provide env paths)
const httpsConfig = (() => {
  const keyPath = process.env.VITE_HTTPS_KEY_PATH || process.env.HTTPS_KEY || '192.168.174.128+2-key.pem'
  const certPath = process.env.VITE_HTTPS_CERT_PATH || process.env.HTTPS_CERT || '192.168.174.128+2.pem'
  try {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  } catch (e) {
    // If cert files are not present, fall back to HTTP
    return undefined
  }
})()

export default defineConfig({
  plugins: [react()],
  // Avoid multiple instances of three by deduping the package
  optimizeDeps: {
    dedupe: ["three", "@react-three/fiber", "@react-three/drei"],
  },
  resolve: {
    dedupe: ["three"],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: httpsConfig,
    proxy: {
      '/auth': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/oidc': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/patient': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/room': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/connection': { target: 'http://127.0.0.1:3001', ws: true, changeOrigin: true },
      '/static': { target: 'http://127.0.0.1:3001', changeOrigin: true },
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.174.128',
    ],
  },
  preview: {
    host: true,
    port: 5173,
    https: httpsConfig,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.174.128',
      'arviewer-demo-123.westeurope.azurecontainer.io',
    ],
  }
})
