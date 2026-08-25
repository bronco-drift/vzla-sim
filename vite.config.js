import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 4250: vzla-sim's dedicated dev port (Marcel's projects use 4173-4250 range).
// host: true exposes the server on LAN so it can be tested from the phone.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4250,
    host: true,
  },
})
