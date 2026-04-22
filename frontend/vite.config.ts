import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {

  const isNetlify = process.env.NETLIFY === 'true';

  return {
    plugins: [react()],
    // Use root base for Netlify, and static path for Django/Render
    base: isNetlify ? '/' : '/static/frontend/',
    build: {
      // Netlify expects 'dist' by default in the base directory
      outDir: isNetlify ? 'dist' : '../truehealth_hms/static/frontend',
      emptyOutDir: true,
    },
    server: {
      allowedHosts: ['drearily-uterine-henry.ngrok-free.dev'],
    },
  }
})

