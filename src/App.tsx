// This file is the central app router.
// It decides which page to show based on the browser URL.
// We use HashRouter instead of BrowserRouter because the app is deployed on GitHub Pages,
// and hash routing works more reliably in static hosting environments.

import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { MarketsPage } from './pages/MarketsPage'
import { NewsPage } from './pages/NewsPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* All pages share the same shell: header, nav, and footer. */}
        <Route element={<Layout />}>
          {/* Home page: shows the global market dashboard. */}
          <Route path="/" element={<MarketsPage />} />

          {/* News page: shows headlines filtered by selected country. */}
          <Route path="/noticias" element={<NewsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
