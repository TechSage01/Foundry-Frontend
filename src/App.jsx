import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import MainLayout from './components/layout/MainLayout.jsx';
import RightSidebar from './components/layout/RightSidebar.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" 
        element={<MainLayout rightSidebar={<RightSidebar />}>
          <Home/>
          </MainLayout>
          }
        />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
}