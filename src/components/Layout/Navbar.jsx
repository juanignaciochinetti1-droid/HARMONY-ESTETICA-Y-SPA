import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Cambiamos Link por NavLink
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

  // --- Función para aplicar estilos dinámicos al Link activo ---
  const activeStyle = ({ isActive }) => ({
    ...styles.linkStyle,
    color: isActive ? '#8c6d4f' : '#a6835a', // Color más oscuro si está activo
    fontWeight: isActive ? '700' : '500',
    borderBottom: isActive ? '2px solid #c5a37d' : '2px solid transparent',
    paddingBottom: '5px'
  });

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
        <li style={styles.menuItem}><NavLink to="/" style={activeStyle} onClick={cerrarMenu}>INICIO</NavLink></li>
        <li style={styles.menuItem}><NavLink to="/servicios" style={activeStyle} onClick={cerrarMenu}>SERVICIOS</NavLink></li>
        <li style={styles.menuItem}><NavLink to="/equipo" style={activeStyle} onClick={cerrarMenu}>EQUIPO</NavLink></li>
        <li style={styles.menuItem}><NavLink to="/vouchers" style={activeStyle} onClick={cerrarMenu}>VOUCHERS</NavLink></li>
        <li style={styles.menuItem}><NavLink to="/mis-turnos" style={activeStyle} onClick={cerrarMenu}>MIS TURNOS</NavLink></li>

        <li style={styles.menuItem}>
          <a href="https://www.instagram.com/harmony.maguiveron" target="_blank" rel="noopener noreferrer" style={styles.linkStyle} onClick={cerrarMenu}>
            INSTAGRAM
          </a>
        </li>

        {userRole === 'ADMIN' && (
          <li style={{...styles.menuItem}}>
            <NavLink to="/admin" style={activeStyle} onClick={cerrarMenu}>
              PANEL DE AVISOS 
            </NavLink>
          </li>
        )}
        
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
    backgroundColor: '#fcfaf7', // Fondo crema suave (Estilo Harmony)
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

  menuMobileClosed: {
    position: 'fixed',
    top: '70px',
    right: '-100%', 
    flexDirection: 'column',
    backgroundColor: '#fcfaf7',
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
    backgroundColor: '#fcfaf7',
    width: '100%',
    height: 'calc(100vh - 70px)',
    padding: '40px',
    gap: '30px',
    boxShadow: '-5px 0 15px rgba(0,0,0,0.05)',
    opacity: 1,
    pointerEvents: 'auto',
    overflowY: 'auto'
  },

  menuItem: { fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '1px' },
  linkStyle: { textDecoration: 'none', color: '#a6835a', display: 'block', transition: 'all 0.3s ease' },

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
    background: '#fff', 
    border: '1px solid #f2e9e1', 
    color: '#8c6d4f', 
    fontSize: '0.7rem', 
    padding: '8px 15px', 
    borderRadius: '20px', 
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
  }
};

export default Navbar;