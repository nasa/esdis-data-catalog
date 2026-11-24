import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
   esbuild: {
    target: 'es2022'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    }
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        entryFileNames: 'dataCatalogMain.js',
        manualChunks: undefined
      }
    }
  }
})
