import { Routes, Route } from 'react-router-dom'
import './App.css'
import Interview from './pages/Interview'
import VoiceInterview from './pages/VoiceInterview'
import HeroSection from './components/HeroSection'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HeroSection />} />
        <Route path='/chats-interview' element={<Interview />} />
        <Route path='/voice-interview' element={<VoiceInterview />} />
      </Routes>
    </div>
  )
}

export default App