import { Routes, Route } from 'react-router-dom'
import './App.css'
import Interview from './pages/Interview'
import HeroSection from './components/HeroSection'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CreateAssessment from './components/assessment/CreateAssessment'
import AssessmentReport from './components/assessment/AssessmentReport'
import AssessmentHistory from './components/assessment/AssessmentHistory'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/mockmate-home-page' element={<HeroSection />} />
        <Route path='/register' element={<Register />} />
        <Route path='/chats-interview' element={<Interview />} />
        <Route path="/assessment/create" element={<CreateAssessment />} />
        <Route path="/assessment/:assessmentId" element={<AssessmentReport/>} />
        <Route path="/assessment/history" element={<AssessmentHistory />} />
      </Routes>
    </div>
  )
}

export default App