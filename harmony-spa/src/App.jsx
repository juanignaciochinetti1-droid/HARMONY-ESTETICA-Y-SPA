import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Equipo from './pages/Equipo';
import Servicios from './pages/Servicios';
import Vouchers from './pages/Vouchers';
import LoginModal from './components/Layout/LoginModal';
import MisTurnos from './components/Clientes/MisTurnos';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Admin from './pages/Admin'; 

// --- 1. COMPONENTE DEL CARTEL DE CONEXIÓN ---
const AlertaConexion = ({ visible }) => {
  if (!visible) return null;
  return (
    <div style={styles.barraConexion}>
      <div style={styles.contenidoBarra}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <span style={styles.textoBarra}>
          <strong>CONEXIÓN INTERRUMPIDA:</strong> Las funciones de guardado se han pausado para proteger tus datos. 
          <span style={styles.reconectando}> Reconectando...</span>
        </span>
      </div>
      <style>{`
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes blink { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

function App() {
  const { profile, loading, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // --- 2. ESTADO DE CONEXIÓN ---
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // --- NUEVO: ESTADO PARA RESPONSIVE GLOBAL ---
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 3. CARTEL DE CONEXIÓN GLOBAL */}
      <AlertaConexion visible={isOffline} />

      <Navbar onLoginClick={() => setIsLoginOpen(true)} userRole={profile?.rol} onLogout={signOut} />
      
      {/* 4. CONTENEDOR CON BLOQUEO ANTI-ERRORES Y ADAPTACIÓN MÓVIL */}
      <div style={{ 
        opacity: isOffline ? 0.6 : 1, 
        pointerEvents: isOffline ? 'none' : 'auto', 
        filter: isOffline ? 'grayscale(0.4) blur(1px)' : 'none',
        transition: 'all 0.5s ease',
        padding: isMobile ? '0 10px' : '0' // Margen de seguridad en móviles
      }}>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/mis-turnos" element={<MisTurnos />} />

          {/* RUTAS PROTEGIDAS */}
          <Route path="/agenda" element={
            <ProtectedRoute>
              <div style={styles.protectedSection}><h2>Agenda de Turnos</h2></div>
            </ProtectedRoute>
          } />
          
          {/* RUTA DE ADMINISTRACIÓN */}
          <Route path="/admin" element={
            <ProtectedRoute roleRequired="ADMIN">
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {isLoginOpen && <LoginModal alCerrar={() => setIsLoginOpen(false)} />}
    </div>
  );
}

// --- 5. ESTILOS ---
const styles = {
  protectedSection: { paddingTop: '120px', textAlign: 'center', color: '#8c6d4f', fontFamily: 'serif' },
  barraConexion: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#8c6d4f',
    color: '#fff',
    padding: '12px 0',
    zIndex: 20000, 
    textAlign: 'center',
    animation: 'slideDown 0.4s ease-out',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  contenidoBarra: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    fontSize: '0.85rem'
  },
  reconectando: {
    marginLeft: '10px',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    animation: 'blink 1.5s infinite',
    color: '#f2e9e1',
    fontWeight: 'bold'
  }
};

export default App;