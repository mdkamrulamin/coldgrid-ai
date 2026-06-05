import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plugins:
// - react(): enables React support in Vite
// - tailwindcss(): enables Tailwind CSS processing through Vite
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
