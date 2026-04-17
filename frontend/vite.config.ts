import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/static/frontend/',
  build: {
    outDir: '../truehealth_hms/static/frontend',
    emptyOutDir: true,
  },
  server: {
    allowedHosts: ['drearily-uterine-henry.ngrok-free.dev'],
  },
})
