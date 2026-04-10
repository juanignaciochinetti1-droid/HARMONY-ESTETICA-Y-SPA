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

// --- COMPONENTE DE ALERTA ---
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
  const { profile, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    // Verificación real de internet (petición pequeña)
    const verificarConexionReal = async () => {
      try {
        await fetch('https://www.google.com/favicon.ico', { 
          mode: 'no-cors', 
          cache: 'no-store' 
        });
        if (isOffline) setIsOffline(false);
      } catch (err) {
        if (!isOffline) setIsOffline(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', handleResize);

    const intervalo = setInterval(verificarConexionReal, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalo);
    };
  }, [isOffline]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', backgroundColor: '#fcfaf7' }}>
      
      {/* EL CARTEL DE BLOQUEO */}
      <OfflineAlert visible={isOffline} />

      {/* CONTENIDO DE LA APP */}
      <div style={{ 
        opacity: isOffline ? 0.3 : 1, 
        pointerEvents: isOffline ? 'none' : 'auto', 
        filter: isOffline ? 'grayscale(0.5) blur(5px)' : 'none',
        transition: 'all 0.6s ease'
      }}>
        <Navbar onLoginClick={() => setIsLoginOpen(true)} userRole={profile?.rol} onLogout={signOut} />
        
        <div style={{ padding: isMobile ? '0 10px' : '0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/equipo" element={<Equipo />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/mis-turnos" element={<MisTurnos />} />
            <Route path="/admin" element={
              <ProtectedRoute roleRequired="ADMIN">
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {isLoginOpen && <LoginModal alCerrar={() => setIsLoginOpen(false)} />}
    </div>
  );
}

const styles = {
  protectedSection: { paddingTop: '120px', textAlign: 'center', color: '#8c6d4f', fontFamily: 'serif' },
  overlayOffline: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(252, 250, 247, 0.9)', 
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 999999, 
    backdropFilter: 'blur(8px)',
  },
  modalOffline: {
    backgroundColor: '#fff', padding: '50px 40px', borderRadius: '40px',
    width: '90%', maxWidth: '450px', textAlign: 'center',
    boxShadow: '0 25px 60px rgba(140, 109, 79, 0.2)', border: '1px solid #f2e9e1',
  },
  iconOffline: { fontSize: '40px', marginBottom: '20px' },
  titleOffline: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '15px', fontWeight: '400' },
  textOffline: { color: '#bfa38a', fontSize: '1rem', lineHeight: '1.6', marginBottom: '30px' },
  loaderOffline: { width: '100%', height: '4px', backgroundColor: '#f2e9e1', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginBottom: '15px' },
  barOffline: { width: '50%', height: '100%', backgroundColor: '#c5a37d', borderRadius: '10px', animation: 'loadingBar 1.5s infinite linear' },
  subtextOffline: { color: '#d1c4b9', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }
};

export default App;