import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (bundled by Vite, no external requests).
import '@fontsource/playfair-display/600.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/800.css'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import '@fontsource/nunito-sans/800.css'
import './index.css'
import App from './App.jsx'

// If an image (e.g. a remote seed photo or avatar) fails to load, swap in a MANNA-styled
// local placeholder instead of showing a broken-image icon. "error" doesn't bubble,
// so this listens in the capture phase on the whole document.
document.addEventListener(
  'error',
  (e) => {
    const img = e.target
    if (!(img instanceof HTMLImageElement) || img.dataset.fallback) return
    img.dataset.fallback = '1'
    img.src = /avatar|pravatar/i.test(img.src + img.className) ? '/default-avatar.svg' : '/image-placeholder.svg'
  },
  true
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
