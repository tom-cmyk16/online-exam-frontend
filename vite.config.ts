import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🚫 Proxy error:', err);
            console.log('💡 Make sure your backend server is running on http://localhost:5000');
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
