import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import MainLayout from './components/layout/MainLayout.jsx';
import RightSidebar from './components/layout/RightSidebar.jsx';
import Profile from './pages/Profile';
import Discover from './pages/Discover.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';
import LandingPage from './pages/LandingPage.jsx'
import ProtectedRoutes from './components/ProtectedRoutes.jsx';
import ManifestoPage from './pages/ManifestoPage.jsx'
export default function App() {
  const [selectedTopic, setSelectedTopic] = React.useState(null);
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path="/signin" element={<SignIn />} />
        <Route path='/verify' element={<VerifyOtp/>} />
        <Route path='/manifesto' element={<ManifestoPage/>}/>
       <Route element={<ProtectedRoutes/>}>
         <Route path="/home" 
        element={<MainLayout rightSidebar={<RightSidebar 
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />}>
          <Home
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
          />
          </MainLayout>
          }
        />
        <Route path="/discover" element={
          <MainLayout>
            <Discover />
          </MainLayout>
        } />

        <Route path="/profile" 
        element={<Profile />} />
       </Route>
        
      </Routes>
    </Router>
  );
}