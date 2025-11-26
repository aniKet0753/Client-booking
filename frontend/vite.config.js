import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['l2gcruise.com'],
  },
  resolve: {
    dedupe: [
      '@ckeditor/ckeditor5-core',
      '@ckeditor/ckeditor5-engine',
      '@ckeditor/ckeditor5-utils',
      '@ckeditor/ckeditor5-theme-lark',
      '@ckeditor/ckeditor5-typing',
      '@ckeditor/ckeditor5-command'
    ]
  },
})
