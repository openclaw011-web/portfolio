import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // relative base: works on GitHub Pages project sites (/portfolio/), subpaths
  // and custom domains alike
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap', 'gsap/ScrollTrigger'],
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})
