import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Public Pages
import LandingPage from './pages/LandingPage.jsx'
import SignIn from './pages/SignIn'
import VerifyOtp from './pages/VerifyOtp.jsx'
import ManifestoPage from './pages/ManifestoPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import OAuthCallback from './pages/OAuthCallBack.jsx'

// Protected & Core Components / Pages
import MainLayout from './components/layout/MainLayout.jsx'
import RightSidebar from './components/layout/RightSidebar.jsx'
import ProtectedRoutes from './components/ProtectedRoutes.jsx'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Discover from './pages/Discover.jsx'
import Opportunities from './pages/Opportunities'
import CreateOpportunity from './pages/CreateOpportunity.jsx'
import Communities from './pages/Communities.jsx'
import CreateCommunity from './pages/CreateCommunity.jsx' // <-- Uncommented here

export default function App() {
  const [selectedTopic, setSelectedTopic] = React.useState(null)

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/manifesto" element={<ManifestoPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route
            path="/home"
            element={
              <MainLayout
                rightSidebar={
                  <RightSidebar
                    selectedTopic={selectedTopic}
                    onSelectTopic={setSelectedTopic}
                  />
                }
              >
                <Home
                  selectedTopic={selectedTopic}
                  onSelectTopic={setSelectedTopic}
                />
              </MainLayout>
            }
          />

          <Route
            path="/discover"
            element={
              <MainLayout>
                <Discover />
              </MainLayout>
            }
          />

          <Route path="/profile" element={<Profile />} />

          <Route path="/opportunities" element={<Opportunities />} />
          <Route
            path="/opportunities/create"
            element={<CreateOpportunity />}
          />

          <Route path="/communities" element={<Communities />} />
          <Route
            path="/communities/create"
            element={<CreateCommunity />}
          />
        </Route>
      </Routes>
    </Router>
  )
}