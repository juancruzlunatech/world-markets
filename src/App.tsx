import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { MarketsPage } from './pages/MarketsPage'
import { NewsPage } from './pages/NewsPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MarketsPage />} />
          <Route path="/noticias" element={<NewsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
