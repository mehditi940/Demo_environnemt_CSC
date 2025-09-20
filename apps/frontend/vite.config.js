import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 5173,
    allowedHosts: [
      'arviewer-demo-123.westeurope.azurecontainer.io'
    ]
  }
})