import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fsPlugin } from './vite-fs-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fsPlugin()],
  server: {
    // Enable handling of local file system requests
    fs: {
      strict: false
    }
  }
})
