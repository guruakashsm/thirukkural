import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import KuralDetail from './pages/KuralDetail'
import Category from './pages/Category'
import Search from './pages/Search'
import Watchlist from './pages/Watchlist'
import Chapter from './pages/Chapter'
import Quiz from './pages/Quiz'
import Browse from './pages/Browse'
import History from './pages/History'
import Explore from './pages/Explore'
import About from './pages/About'
import HowToRead from './pages/HowToRead'
import Contact from './pages/Contact'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kural/:number" element={<KuralDetail />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/chapter/:number" element={<Chapter />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/history" element={<History />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-to-read" element={<HowToRead />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
