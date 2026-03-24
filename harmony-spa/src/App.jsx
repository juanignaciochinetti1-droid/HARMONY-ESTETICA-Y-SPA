import React, { useState, useEffect } from 'react'; // <--- AGREGADO useEffect
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Equipo from './pages/Equipo';
import Servicios from './pages/Servicios';
import Vouchers from './pages/Vouchers';
import LoginModal from './components/Layout/LoginModal';
import MisTurnos from './components/Clientes/MisTurnos';

// Herramientas de seguridad centralizadas
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { profile, loading, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Seguro de vida: si en 3 segundos no cargó, desbloqueamos la pantalla
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimedOut(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Si está cargando Y no hay perfil Y no pasaron los 3 segundos, mostramos cargando
  if (loading && !profile && !timedOut) {
    return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fcfaf7'}}>
        <h1 style={{color: '#a6835a', fontFamily: 'Playfair Display'}}>Cargando Harmony Spa...</h1>
      </div>
    );
  }

  return (
    <div>
      <Navbar onLoginClick={() => setIsLoginOpen(true)} userRole={profile?.rol} onLogout={signOut} />
      
      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Home />} />
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/servicios" element={<Servicios />} />
        
        {/* Vouchers: Pública para que el cliente compre, 
            pero la lógica interna esconderá los botones de Admin */}
        <Route path="/vouchers" element={<Vouchers />} />

        {/* Mis Turnos: El cliente entra aquí para buscar por DNI/Email */}
        <Route path="/mis-turnos" element={<MisTurnos />} />

        {/* --- RUTAS PROTEGIDAS (REQUIEREN ROL ESPECÍFICO) --- */}
        
        {/* Solo el personal del SPA (Admin o Empleado) puede ver la Agenda */}
        <Route 
          path="/agenda" 
          element={
            <ProtectedRoute>
              <div style={{paddingTop: '100px', textAlign: 'center'}}>
                <h2>Agenda de Turnos - Harmony Spa</h2>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Solo la Administradora (Clienta) puede entrar al Panel Global */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roleRequired="ADMIN">
              <div style={{paddingTop: '100px', textAlign: 'center'}}>
                <h2>Panel de Administración Global</h2>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Redirección por defecto: Si escriben cualquier cosa, al Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modal de Login: Ya no necesita 'actualizarUser' porque 
          el AuthProvider detecta el login automáticamente */}
      {isLoginOpen && (
        <LoginModal 
          alCerrar={() => setIsLoginOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;