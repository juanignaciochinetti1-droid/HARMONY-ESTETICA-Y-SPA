import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Importante: Navigate aquí
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Equipo from './pages/Equipo';
import Servicios from './pages/Servicios';
import Vouchers from './pages/Vouchers';
import LoginModal from './components/Layout/LoginModal';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('harmony_rol'));

  const actualizarUser = () => {
    setUserRole(localStorage.getItem('harmony_rol'));
  };

  return (
    <div>
      <Navbar onLoginClick={() => setIsLoginOpen(true)} userRole={userRole} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/vouchers" element={<Vouchers />} />

        {/* VISTAS TEMPORALES (Sin archivos externos para que no de error) */}
        {userRole === 'EMPLEADO' && (
          <Route path="/agenda" element={<div style={{paddingTop: '100px', textAlign: 'center'}}><h2>Próximamente: Agenda de Empleado</h2></div>} />
        )}
        
        {userRole === 'ADMIN' && (
          <Route path="/admin" element={<div style={{paddingTop: '100px', textAlign: 'center'}}><h2>Próximamente: Panel de Administración</h2></div>} />
        )}

        {/* Redirección de seguridad: Si la ruta no existe, vuelve al Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isLoginOpen && (
        <LoginModal 
          alCerrar={() => setIsLoginOpen(false)} 
          alLoguear={actualizarUser} 
        />
      )}
    </div>
  );
}

export default App;