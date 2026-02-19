import React, { useState } from 'react'; // Agregamos useState
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Equipo from './pages/Equipo';
import Servicios from './pages/Servicios';
import Vouchers from './pages/Vouchers';
import LoginModal from './components/Layout/LoginModal'; // Cambiamos la importación

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div>
      {/* Pasamos la función al Navbar */}
      <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/vouchers" element={<Vouchers />} />
        {/* Ya no necesitamos la Route de login */}
      </Routes>

      {/* Renderizado condicional del Modal */}
      {isLoginOpen && <LoginModal alCerrar={() => setIsLoginOpen(false)} />}
    </div>
  );
}

export default App;