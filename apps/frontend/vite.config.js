import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Avoid multiple instances of three by deduping the package
  optimizeDeps: {
    dedupe: ["three", "@react-three/fiber", "@react-three/drei"],
  },
  resolve: {
    dedupe: ["three"],
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: [
      'arviewer-demo-123.westeurope.azurecontainer.io'
    ]
  }
})
