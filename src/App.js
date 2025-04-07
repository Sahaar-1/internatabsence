import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DemmandeAbsence from "./pages/DemmandeAbsence";
import AdminDemmande from "./pages//AdminDemmande";
import Historique from "./pages//Historique";
import Calendar from "./pages/Calendar";
import "./pages//admin.css";

const App = () => {
  return (
    <div>
    <Router>
        <Routes>
          <Route path="/" element={<DemmandeAbsence />} />
          <Route path="/admin" element={<AdminDemmande />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/Calendar" element={<Calendar />} />
        </Routes>
      
    </Router>
    </div>

  );
};

export default App;
