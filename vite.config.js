import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Makes `src/style/` a load path so every SCSS file can write
        // `@use "variables" as *` without relative path chains.
        loadPaths: [path.resolve(__dirname, 'src/style')]
      }
    }
  }
})
