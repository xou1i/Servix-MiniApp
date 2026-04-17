import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // ── Dev Proxy — bypasses CORS by routing API requests through Vite ──
    // The browser sees requests to localhost:5173/api/... → no CORS issues.
    // Vite forwards them to the actual backend (localtunnel or direct).
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_ORIGIN || 'https://restaurantsystem-oe83.onrender.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': 'true'
        }
      },
      // SignalR WebSocket hub
      '/orderHub': {
        target: process.env.VITE_BACKEND_ORIGIN || 'https://restaurantsystem-oe83.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': 'true'
        }
      },
    },
  },
})
