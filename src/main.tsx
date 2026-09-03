// This file is the actual entry point of the React application.
// It imports the global CSS, mounts the root React component into the DOM,
// and wraps it in StrictMode so React checks for common mistakes during development.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// React finds the element with id="root" in index.html and renders the application there.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* StrictMode helps catch unsafe code patterns in development. */}
    <App />
  </StrictMode>,
)
