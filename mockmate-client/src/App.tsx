import { Routes, Route } from 'react-router-dom'
import './App.css'
import Interview from './pages/Interview'
import VoiceInterview from './pages/VoiceInterview'
import HeroSection from './components/HeroSection'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/mockmate-home-page' element={<HeroSection />} />
        <Route path='/register' element={<Register />} />
        <Route path='/chats-interview' element={<Interview />} />
        <Route path='/voice-interview' element={<VoiceInterview />} />
      </Routes>
    </div>
  )
}

export default App