import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import dns from 'node:dns'

// Evita reordenação de DNS em localhost que pode causar problemas de conexão
dns.setDefaultResultOrder('verbatim')

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8080,
    hmr: {
      protocol: 'ws',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Alias para evitar carregamento do Radix Tooltip
      "@radix-ui/react-tooltip": path.resolve(__dirname, "./src/components/ui/tooltip.tsx"),
      // Alias para evitar carregamento do TanStack Query
      "@tanstack/react-query": path.resolve(__dirname, "./src/components/ui/query-client.tsx"),
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@radix-ui/react-tooltip', '@tanstack/react-query'],
    force: true
  }
})
