import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_ORIGIN || 'https://restaurantsystem-oe83.onrender.com',
          changeOrigin: true,
          secure: false,
          headers: {
            'Bypass-Tunnel-Reminder': 'true',
            'ngrok-skip-browser-warning': 'true'
          }
        },
        '/orderHub': {
          target: env.VITE_BACKEND_ORIGIN || 'https://restaurantsystem-oe83.onrender.com',
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
  };
})
