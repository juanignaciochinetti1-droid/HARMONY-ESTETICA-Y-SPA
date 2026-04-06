import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const Navbar = ({ onLoginClick }) => { 
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
      if (window.innerWidth > 850) setMenuAbierto(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nombreUsuario = profile?.nombre;
  const userRole = profile?.rol;

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div 
        style={{...styles.logoContainer, cursor: 'pointer'}} 
        onClick={() => { navigate('/'); cerrarMenu(); }}
      >
        <img src="/flor-logo.png" alt="Harmony Logo" style={styles.logoImg} />
        <div>
          <h1 style={styles.logoText}>HARMONY</h1>
          <p style={styles.logoSubtext}>ESTÉTICA Y SPA</p>
        </div>
      </div>

      {/* Botón Hamburguesa */}
      {isMobile && (
        <button 
          onClick={() => setMenuAbierto(!menuAbierto)} 
          style={styles.hamburger}
        >
          {menuAbierto ? '✕' : '☰'}
        </button>
      )}

      {/* Menú de Links */}
      <ul style={{
        ...styles.menu,
        ...(isMobile ? (menuAbierto ? styles.menuMobileOpen : styles.menuMobileClosed) : {})
      }}>
        <li style={styles.menuItem}><Link to="/" style={styles.linkStyle} onClick={cerrarMenu}>INICIO</Link></li>
        <li style={styles.menuItem}><Link to="/servicios" style={styles.linkStyle} onClick={cerrarMenu}>SERVICIOS</Link></li>
        <li style={styles.menuItem}><Link to="/equipo" style={styles.linkStyle} onClick={cerrarMenu}>EQUIPO</Link></li>
        <li style={styles.menuItem}><Link to="/vouchers" style={styles.linkStyle} onClick={cerrarMenu}>VOUCHERS</Link></li>
        <li style={styles.menuItem}><Link to="/mis-turnos" style={styles.linkStyle} onClick={cerrarMenu}>MIS TURNOS</Link></li>

        <li style={styles.menuItem}>
          <a href="https://www.instagram.com/harmony.maguiveron" target="_blank" rel="noopener noreferrer" style={styles.linkStyle} onClick={cerrarMenu}>
            INSTAGRAM
          </a>
        </li>

        {userRole === 'ADMIN' && (
          <li style={{...styles.menuItem, fontWeight: 'bold'}}>
            <Link to="/admin" style={{...styles.linkStyle, color: '#8c6d4f'}} onClick={cerrarMenu}>
              PANEL DE AVISOS 
            </Link>
          </li>
        )}
        
        {/* --- SECCIÓN DE USUARIO INTEGRADA AL MENÚ --- */}
        {/* Esto ahora es un <li> más del <ul>, por lo que hereda el ocultamiento del menú mobile */}
        <li style={isMobile ? styles.liUserMobile : styles.liUserPC}>
          {profile ? (
            <div style={isMobile ? styles.userFlexMobile : styles.userFlexPC}>
              <div style={isMobile ? styles.userInfoMobile : styles.userInfoPC}>
                <span style={styles.userName}>Hola, {nombreUsuario}</span>
                {userRole && <span style={styles.roleBadge}>{userRole}</span>}
              </div>
              <button onClick={() => { signOut(); cerrarMenu(); }} style={styles.btnSalir}>SALIR</button>
            </div>
          ) : (
            <div onClick={() => { onLoginClick(); cerrarMenu(); }} style={styles.loginTrigger}>
              <span role="img" aria-label="user" style={styles.loginIcon}>👤</span>
              <span style={styles.loginText}>ACCEDER</span>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 5%',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f2e9e1',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    height: '70px',
    boxSizing: 'border-box'
  },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoImg: { width: '35px', height: 'auto' },
  logoText: { margin: 0, fontSize: '1.1rem', letterSpacing: '2px', color: '#8c6d4f', fontWeight: '400' },
  logoSubtext: { margin: 0, fontSize: '0.45rem', letterSpacing: '3px', color: '#bfa38a', textAlign: 'center' },
  
  menu: { 
    display: 'flex', 
    listStyle: 'none', 
    gap: '20px', 
    margin: 0, 
    alignItems: 'center',
    transition: 'all 0.3s ease-in-out'
  },

  hamburger: {
    background: 'none',
    border: 'none',
    fontSize: '1.8rem',
    color: '#8c6d4f',
    cursor: 'pointer',
    zIndex: 1001
  },

  // --- LOGICA DE VISIBILIDAD ---
  menuMobileClosed: {
    position: 'fixed',
    top: '70px',
    right: '-100%', 
    flexDirection: 'column',
    backgroundColor: '#fff',
    width: '100%',
    height: 'calc(100vh - 70px)',
    padding: '40px',
    gap: '30px',
    opacity: 0,
    pointerEvents: 'none'
  },
  menuMobileOpen: {
    position: 'fixed',
    top: '70px',
    right: '0', 
    flexDirection: 'column',
    backgroundColor: '#fff',
    width: '100%',
    height: 'calc(100vh - 70px)',
    padding: '40px',
    gap: '30px',
    boxShadow: '-5px 0 15px rgba(0,0,0,0.05)',
    opacity: 1,
    pointerEvents: 'auto',
    overflowY: 'auto'
  },

  menuItem: { fontSize: '0.75rem', color: '#a6835a', cursor: 'pointer', letterSpacing: '1px', fontWeight: '500' },
  linkStyle: { textDecoration: 'none', color: 'inherit', display: 'block' },

  // --- ESTILOS USUARIO / LOGIN ---
  liUserPC: { marginLeft: '10px' },
  liUserMobile: { width: '100%', borderTop: '1px solid #f2e9e1', paddingTop: '20px' },
  
  userFlexPC: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #f2e9e1', paddingLeft: '20px' },
  userFlexMobile: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  
  userInfoPC: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  userInfoMobile: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  
  userName: { fontSize: '0.8rem', color: '#8c6d4f', fontWeight: 'bold', textTransform: 'uppercase' },
  roleBadge: { fontSize: '0.6rem', color: '#bfa38a', letterSpacing: '1px' },
  
  loginTrigger: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', color: '#8c6d4f' },
  loginIcon: { fontSize: '1rem' },
  loginText: { fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' },

  btnSalir: { 
    background: '#fdfcfb', 
    border: '1px solid #f2e9e1', 
    color: '#8c6d4f', 
    fontSize: '0.7rem', 
    padding: '8px 15px', 
    borderRadius: '20px', 
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Navbar;