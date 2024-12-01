import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Pratiklerim from "./components/PratikPage";
import Mulakatlarim from "./components/Mulakatlarim";
import PratikOlustur from "./components/PratikOlustur";
import ProfilAyarları from "./components/ProfilAyarlari";

const App = () => {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pratiklerim" element={<Pratiklerim />} />
            <Route path="/mulakatlarim" element={<Mulakatlarim />} />
            <Route path="/pratik-olustur" element={<PratikOlustur />} />
            <Route path="/profil-ayarlari" element={<ProfilAyarları />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
