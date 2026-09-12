import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import MainLayout from "./components/layout/MainLayout.jsx";
import RightSidebar from "./components/layout/RightSidebar.jsx";
import Profile from "./pages/Profile";
import CreateOpportunity from "./pages/CreateOpportunity.jsx";
import Opportunities from "./pages/Opportunities";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout rightSidebar={<RightSidebar />}>
              <Home />
            </MainLayout>
          }
        />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/opportunities/create" element={<CreateOpportunity />} />
      </Routes>
    </Router>
  );
}
