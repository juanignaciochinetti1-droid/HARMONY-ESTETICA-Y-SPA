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

// --- 1. COMPONENTE DE ALERTA DE CONEXIÓN (PANTALLA COMPLETA) ---
const OfflineAlert = ({ visible }) => {
  if (!visible) return null;

  return (
    <div style={styles.overlayOffline}>
      <div style={styles.modalOffline}>
        <div style={styles.iconOffline}>📡</div>
        <h3 style={styles.titleOffline}>Conexión Perdida</h3>
        <p style={styles.textOffline}>
          Parece que no tienes conexión a internet. <br />
          <strong>Harmony</strong> necesita estar en línea para guardar tus cambios y gestionar los turnos.
        </p>
        <div style={styles.loaderOffline}>
          <div style={styles.barOffline}></div>
        </div>
        <p style={styles.subtextOffline}>Intentando reconectar automáticamente...</p>
      </div>
      <style>
        {`
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};

function App() {
  const { profile, loading, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // --- 2. LÓGICA DE DETECCIÓN DE RED Y RESPONSIVE ---
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // --- ESTADO PARA RESPONSIVE GLOBAL ---
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
      <OfflineAlert visible={isOffline} />

      <Navbar onLoginClick={() => setIsLoginOpen(true)} userRole={profile?.rol} onLogout={signOut} />
      
      {/* 4. CONTENEDOR PRINCIPAL: BLOQUEO ANTI-ERRORES Y ADAPTACIÓN MÓVIL */}
      <div style={{ 
        opacity: isOffline ? 0.3 : 1, 
        pointerEvents: isOffline ? 'none' : 'auto', 
        filter: isOffline ? 'grayscale(0.4) blur(4px)' : 'none',
        transition: 'all 0.6s ease',
        padding: isMobile ? '0 10px' : '0' 
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

// --- 5. ESTILOS INTEGRADOS ---
const styles = {
  protectedSection: { paddingTop: '120px', textAlign: 'center', color: '#8c6d4f', fontFamily: 'serif' },
  
  overlayOffline: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(252, 250, 247, 0.85)', 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999, 
    backdropFilter: 'blur(10px)',
  },
  modalOffline: {
    backgroundColor: '#fff',
    padding: '50px 40px',
    borderRadius: '40px',
    width: '90%',
    maxWidth: '450px',
    textAlign: 'center',
    boxShadow: '0 25px 60px rgba(140, 109, 79, 0.15)',
    border: '1px solid #f2e9e1',
  },
  iconOffline: {
    fontSize: '40px',
    marginBottom: '20px',
    filter: 'grayscale(1)',
    opacity: 0.7
  },
  titleOffline: {
    color: '#8c6d4f',
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
    marginBottom: '15px',
    fontWeight: '400'
  },
  textOffline: {
    color: '#bfa38a',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  loaderOffline: {
    width: '100%',
    height: '4px',
    backgroundColor: '#f2e9e1',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '15px'
  },
  barOffline: {
    width: '50%',
    height: '100%',
    backgroundColor: '#c5a37d',
    borderRadius: '10px',
    animation: 'loadingBar 1.5s infinite linear',
  },
  subtextOffline: {
    color: '#d1c4b9',
    fontSize: '0.75rem',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }
};

export default App;